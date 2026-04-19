import React, { useState, useEffect } from 'react';
import { useInterview } from '../InterviewContext';
import interviewerAvatar from '../assets/interviewer.svg';
import hangupIcon from '../assets/hangup.svg';

const AIInterviewWidget = () => {
    const { isInterviewWidgetOpen, closeInterviewWidget } = useInterview();
    const [interviewState, setInterviewState] = useState('setup'); // 'setup', 'interviewing', 'finished'
    const [cvFile, setCvFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');

    // Reset state when widget is closed
    useEffect(() => {
        if (!isInterviewWidgetOpen) {
            setInterviewState('setup');
            setCvFile(null);
            setJobDescription('');
        }
    }, [isInterviewWidgetOpen]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cvFile || !jobDescription) {
            alert('Vui lòng tải lên CV và nhập mô tả công việc.');
            return;
        }
        // Logic to send data to the backend and start the interview would go here.
        console.log('Starting interview with:', { cvFile, jobDescription });
        setInterviewState('interviewing');
    };

    const handleHangUp = () => {
        // Logic to signal the backend to end the interview would go here.
        console.log('Interview ended by user.');
        setInterviewState('finished');
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
                <div className="text-center text-gray-300 italic">
                    Hãy nhấn Submit khi bạn đã sẵn sàng.
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors">
                    Submit
                </button>
            </form>
        </>
    );

    const renderInterviewScreen = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <img src={interviewerAvatar} alt="AI Interviewer" className="w-48 h-48 rounded-full border-4 border-green-500 shadow-lg mb-8" />
            <p className="text-xl text-gray-300 mb-12">Cuộc phỏng vấn đang diễn ra...</p>
            <button
                onClick={handleHangUp}
                className="flex items-center justify-center py-3 px-8 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold transition-colors shadow-lg"
            >
                <img src={hangupIcon} alt="Hang up" className="w-6 h-6 mr-3" />
                Dập máy
            </button>
        </div>
    );

    const renderResultsScreen = () => (
        <div className="text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-green-500 mb-4">Kết quả Phỏng vấn</h2>
            <p className="text-gray-300 mb-8">Phân tích và đánh giá sẽ được hiển thị ở đây trong tương lai.</p>
            <div className="bg-gray-700 p-6 rounded-lg w-full min-h-[200px] flex items-center justify-center">
                <p className="italic text-gray-400">Đang chờ thiết kế cho màn hình kết quả...</p>
            </div>
            <button
                onClick={closeInterviewWidget}
                className="mt-8 px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold"
            >
                Đóng
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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
