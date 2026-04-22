import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInterview } from '../InterviewContext';
import interviewerAvatar from '../assets/interviewer.svg';
import hangupIcon from '../assets/hangup.svg';
import interviewService from '../services/interview.service';
import { getSocket } from '../services/socket';

const AIInterviewWidget = () => {
    const { isInterviewWidgetOpen, closeInterviewWidget } = useInterview();
    const [interviewState, setInterviewState] = useState('setup'); // 'setup', 'interviewing', 'finished'
    const [cvFile, setCvFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 phút = 900 giây

    const recognition = useRef(null);
    const audioContext = useRef(null);
    const socket = getSocket();
    const timerIdRef = useRef(null); // Ref để lưu ID của interval
    const silenceTimeRef=useRef(null);

    // Reset state when widget is closed
    useEffect(() => {
        if (!isInterviewWidgetOpen) {
            setInterviewState('setup');
            setCvFile(null);
            setJobDescription('');
            setIsLoading(false);
            setError('');
            setSessionId(null);
            setAnalysisResult(null);
            setTimeLeft(900);
            if (timerIdRef.current) clearInterval(timerIdRef.current);
        }
    }, [isInterviewWidgetOpen]);

    //hanle no response from candidate
    const handleNoResponse=useCallback(() => {
        if (socket && sessionId && interviewState === 'interviewing') {
            console.log("Ứng viên im lặng quá lâu, chuyển câu hỏi...");
            // Gửi một tin nhắn đặc biệt cho AI
            socket.emit('user_text_turn', { 
                sessionId, 
                text: "[Hệ thống: Ứng viên không trả lời được câu hỏi này, vui lòng bỏ qua và chuyển sang câu tiếp theo hoặc gợi ý cho họ]" 
            });
            setIsAiSpeaking(true); // Đợi AI phản hồi
            if (recognition.current) recognition.current.stop(); // Dừng mic tạm thời
        }
    }, [socket, sessionId, interviewState]);
    //send end_interview->receive last gooobye->receive interview_ended (call handleInterviewEnded) to get analysis result and final message->set state to finished to show result screen
    const handleHangUp = useCallback(() => {
        if (socket && sessionId) {
            if (timerIdRef.current) {
                clearInterval(timerIdRef.current);
            }
            setIsLoading(true);
            socket.emit('end_interview', { sessionId });
            if (recognition.current) {
                recognition.current.stop();
            }
        }
    }, [socket, sessionId]);

    // Effect để quản lý bộ đếm thời gian
    useEffect(() => {
        if (interviewState === 'interviewing') {
            setTimeLeft(900); // Reset bộ đếm
            timerIdRef.current = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(timerIdRef.current); // Dọn dẹp khi unmount
    }, [interviewState]);

    // Effect để kết thúc phỏng vấn khi hết giờ
    useEffect(() => {
        if (timeLeft <= 0 && interviewState === 'interviewing') {
            handleHangUp();
        }
    }, [timeLeft, interviewState, handleHangUp]);

    // Main effect for handling the interview lifecycle
    useEffect(() => {
        if (interviewState !== 'interviewing' || !sessionId || !socket) return;

        // 1. Setup AudioContext (TTS)
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 2. Setup SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Vui lòng dùng Chrome.");
            return;
        }
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        //có thể cần xử lý nói ngắt quãng
        recognition.current.lang = 'vi-VN';

        recognition.current.onstart = () => setIsListening(true);
        recognition.current.onend = () => setIsListening(false);
        recognition.current.onerror = (event) => console.error("Speech recognition error", event.error);
        recognition.current.onresult = (event) => {
            //reset silence timer
            if(silenceTimeRef.current)clearTimeout(silenceTimerRef.current);

            const userText = event.results[event.results.length - 1][0].transcript.trim();
            if (userText) {
                socket.emit('user_text_turn', { sessionId, text: userText });
                setIsAiSpeaking(true);
            }
        };

        // 3. Setup Socket Listeners
        socket.emit('join_interview_session', sessionId);

        const audioQueue = [];
        let isPlaying = false;

        const playNextAudio = async () => {
            if (isPlaying || audioQueue.length === 0) {
                if (!isPlaying) {
                    setIsAiSpeaking(false);
                    if (interviewState === 'interviewing' && recognition.current) {
                        try { recognition.current.start(); } catch (e) { console.warn("Recognition start failed:", e.message); }
                    }
                }
                return;
            }
            isPlaying = true;
            setIsAiSpeaking(true);

            const audioData = audioQueue.shift();
            try {
                const audioBuffer = await audioContext.current.decodeAudioData(audioData);
                const source = audioContext.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.current.destination);
                source.start();
                source.onended = () => { 
                    isPlaying = false; playNextAudio(); 
                
                    //start count silence time
                    if(audioQueue.length === 0){
                        if(silenceTimeRef.current)clearTimeout(silenceTimeRef.current);
                        silenceTimeRef.current = setTimeout(handleNoResponse, 30000); // 30 giây im lặng sẽ kích hoạt handleNoResponse
                    }
                };
            } catch (e) {
                console.error("Error decoding audio data", e);
                isPlaying = false;
                playNextAudio();
            }
        };

        const handleAudioChunk = (data) => {
            if (data.sessionId === sessionId) {
                audioQueue.push(data.audioChunk.buffer);
                playNextAudio();
            }
        };

        const handleInterviewEnded = (data) => {
            if (data.sessionId === sessionId) {
                setAnalysisResult(data.analysis);
                setInterviewState('finished');
                setIsLoading(false);
                if (timerIdRef.current) clearInterval(timerIdRef.current); // Dừng timer khi có kết quả
            }
        };

        socket.on('ai_audio_chunk', handleAudioChunk);
        socket.on('interview_ended', handleInterviewEnded);

        return () => {
            socket.emit('leave_interview_session', sessionId);
            socket.off('ai_audio_chunk', handleAudioChunk);
            socket.off('interview_ended', handleInterviewEnded);
            if (recognition.current) recognition.current.abort();
            if (timerIdRef.current) clearInterval(timerIdRef.current);
            if (audioContext.current && audioContext.current.state !== 'closed') audioContext.current.close();
            if(silenceTimeRef.current)clearTimeout(silenceTimeRef.current);
        };
    }, [interviewState, sessionId, socket]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cvFile || !jobDescription) {
            setError('Vui lòng tải lên CV và nhập mô tả công việc.');
            return;
        }
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('cv', cvFile);
        formData.append('jdContext', jobDescription);

        try {
            const response = await interviewService.initiate(formData);
            const { sessionId: newSessionId } = response.data;
            setSessionId(newSessionId);
            setInterviewState('interviewing');
            setIsAiSpeaking(true); // AI will greet first
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi bắt đầu phỏng vấn.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isInterviewWidgetOpen) {
        return null;
    }

    const renderSetupScreen = () => (
        <>
            <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Phỏng vấn AI</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="cv-upload" className="block text-white mb-2 font-semibold">Tải lên CV của bạn (PDF, DOCX) *</label>
                    <input
                        id="cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                        required
                    />
                    {cvFile && <p className="text-sm text-gray-300 mt-2">Đã chọn: {cvFile.name}</p>}
                </div>
                <div>
                    <label htmlFor="job-description" className="block text-white mb-2 font-semibold">Dán mô tả công việc (JD) *</label>
                    <textarea
                        id="job-description"
                        rows="8"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Dán toàn bộ nội dung mô tả công việc vào đây..."
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="text-center text-gray-300 italic">
                    Hãy nhấn Submit khi bạn đã sẵn sàng.
                </div>
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors disabled:bg-gray-500"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang khởi tạo...' : 'Bắt đầu'}
                </button>
            </form>
        </>
    );

    const renderInterviewScreen = () => (
        <div className="flex flex-col h-full items-center justify-between">
            <div className="flex-shrink-0 flex flex-col items-center mt-8">
                <img src={interviewerAvatar} alt="AI Interviewer" className="w-32 h-32 rounded-full border-4 border-green-500 shadow-lg mb-4" />
                <div className="h-8">
                    {isAiSpeaking && <p className="text-lg text-green-400 animate-pulse">AI đang nói...</p>}
                    {isListening && <p className="text-lg text-blue-400 animate-pulse">Đang lắng nghe bạn...</p>}
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center mb-8">
                <button
                    onClick={handleHangUp}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-8 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold transition-colors shadow-lg disabled:bg-red-800"
                >
                    <img src={hangupIcon} alt="Hang up" className="w-6 h-6 mr-3" />
                    {isLoading ? 'Đang xử lý...' : 'Dập máy'}
                </button>
            </div>
        </div>
    );

    const renderResultsScreen = () => (
        <div className="text-left flex flex-col h-full">
            <h2 className="text-2xl font-bold text-green-500 mb-4 text-center">Kết quả Phỏng vấn</h2>
            {analysisResult ? (
                <div className="bg-gray-900 p-6 rounded-lg w-full flex-grow overflow-y-auto">
                    <h3 className="text-xl font-semibold text-green-400 mb-2">Tóm tắt</h3>
                    <p className="text-gray-300 mb-4">{analysisResult.summary}</p>

                    <h3 className="text-xl font-semibold text-green-400 mb-2">Chấm điểm (Thang điểm 10)</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        {Object.entries(analysisResult.scores || {}).map(([key, value]) => (
                            <div key={key} className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-gray-400 capitalize">{key.replace('_', ' ')}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-green-400 mb-2">Điểm mạnh</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                {analysisResult.strengths?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-red-400 mb-2">Điểm yếu</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                {analysisResult.weaknesses?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-700 p-6 rounded-lg w-full flex-grow flex items-center justify-center">
                    <p className="italic text-gray-400">Đang chờ kết quả phân tích...</p>
                </div>
            )}
            <div className="text-center mt-6">
                <button onClick={closeInterviewWidget} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold">Đóng</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 w-11/12 max-w-7xl h-[85vh] p-8 rounded-lg border border-white relative overflow-y-auto">
                <button
                    onClick={closeInterviewWidget}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {interviewState === 'setup' && renderSetupScreen()}
                {interviewState === 'interviewing' && renderInterviewScreen()}
                {interviewState === 'finished' && renderResultsScreen()}
            </div>
        </div>
    );
};

export default AIInterviewWidget;
