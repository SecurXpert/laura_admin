import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Upload, Loader2, Plus } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import BulkUploadQuestionModal from './BulkUploadQuestionModal';
import QuestionForm, { Question, Quiz } from './QuestionForm';

// ─── Config ────────────────────────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

// ─── Main Component ────────────────────────────────────────────────────────
export default function QuestionBank() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [selectedQuizId, setSelectedQuizId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [quizFetchLoading, setQuizFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    const isInEditMode = showAddForm || showBulkForm;

    useEffect(() => {
        const quizIdFromURL = searchParams.get('quiz_id');
        if (quizIdFromURL) {
            setSelectedQuizId(quizIdFromURL);
        }
    }, [searchParams]);

    // Shuffle function
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            setQuizFetchLoading(true);
            const token = getAccessToken();
            if (!token) {
                toast.error('Please log in to view quizzes');
                navigate('/login');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/admin/quizzes`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                });

                if (!res.ok) throw new Error(`Failed (${res.status})`);

                const data = await res.json();
                const quizList = Array.isArray(data) ? data : data.quizzes ?? data.data ?? [];
                const formatted = quizList
                    .filter((item: any) => item?.id && item?.title !== 'string' && item?.title !== 'String')
                    .map((item: any) => ({
                        id: Number(item.id),
                        title: item.title || item.quiz_title || item.name || `Quiz #${item.id}`,
                        course_id: item.course_id,
                    }));

                setQuizzes([...formatted].reverse());
            } catch (err: any) {
                setError(err.message || 'Could not load quizzes');
                toast.error(err.message || 'Could not load quizzes');
            } finally {
                setQuizFetchLoading(false);
            }
        };

        fetchQuizzes();
    }, [navigate]);

    // Fetch questions
    useEffect(() => {
        if (isInEditMode || !selectedQuizId) {
            setQuestions([]);
            setSelectedQuestion(null);
            return;
        }

        const fetchQuestions = async () => {
            setFetchLoading(true);
            const token = getAccessToken();
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE_URL}/subadmin/quiz-view/${selectedQuizId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                });

                if (!res.ok) throw new Error('Failed to fetch questions');

                const data: Question[] = await res.json();
                const validQuestions = (Array.isArray(data) ? data : []).filter(
                    q => q && q.id && q.question_text && q.question_text !== 'string' && q.question_text !== 'String' && q.option_a !== 'string'
                );
                const shuffledData = shuffleArray(validQuestions);
                setQuestions(shuffledData);
                setSelectedQuestion(shuffledData.length > 0 ? shuffledData[0] : null);
            } catch (err: any) {
                toast.error(err.message || 'Could not load questions');
                setQuestions([]);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchQuestions();
    }, [selectedQuizId, isInEditMode]);

    const handleEditClick = () => {
        if (!selectedQuestion) return;
        setEditingQuestionId(selectedQuestion.id);
        setIsEditing(true);
        setShowAddForm(true);
    };

    const handleDeleteClick = async () => {
        if (!selectedQuestion) return;
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        setLoading(true);
        try {
            const token = getAccessToken();
            if (!token) {
                toast.error('No authentication token');
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/subadmin/questions/${selectedQuestion.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete question');
            }

            toast.success('Question deleted successfully!');
            setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestion.id));
            setSelectedQuestion(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete question');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuestions = questions.filter((q) =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {!showAddForm ? (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Question Bank</h1>
                            <p className="text-muted-foreground">Manage and preview your questions</p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 text-[#3B82F6] border-[#3B82F6] hover:bg-blue-50 h-[45px] px-6 rounded-xl font-medium bg-white"
                                onClick={() => setShowBulkForm(true)}
                            >
                                <Upload className="w-4 h-4" />
                                Bulk Upload CSV
                            </Button>
                            <Button
                                className="flex items-center gap-2 text-white h-[45px] px-6 rounded-xl font-medium transition-opacity hover:opacity-90 border-none"
                                style={{
                                    background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                                    boxShadow: '0px 5.4px 8.1px -5.4px #AD46FF40, 0px 13.49px 20.24px -4.05px #AD46FF40'
                                }}
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingQuestionId(null);
                                    setShowAddForm(true);
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Question
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Main Layout - List + Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Panel */}
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-4 mb-6 h-10">
                                <Label className="text-gray-500 font-medium whitespace-nowrap text-[15px]">Filter by Quiz:</Label>

                                <Select
                                    value={selectedQuizId}
                                    onValueChange={(val) => setSelectedQuizId(val)}
                                    disabled={quizFetchLoading}
                                >
                                    <SelectTrigger className="w-[200px] bg-white border-gray-200 rounded-xl h-10 text-[15px] font-medium text-gray-700">
                                        <SelectValue placeholder="All Quizzes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quizzes.map((quiz) => (
                                            <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                                {quiz.title} {quiz.course_id ? `(Course ${quiz.course_id})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className="text-[15px] text-gray-500 whitespace-nowrap font-medium">
                                    {filteredQuestions.length} questions
                                </span>
                            </div>

                            <div
                                className="flex flex-col"
                                style={{
                                    width: '100%',
                                    maxWidth: '562.91px',
                                    height: '765.03px',
                                    gap: '21.59px',
                                    opacity: 1
                                }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search questions..."
                                        className="pl-9 bg-white border-gray-200 rounded-xl py-6"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                                    {fetchLoading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : questions.length === 0 ? (
                                        <Card className="p-12 text-center text-muted-foreground bg-gray-50/50 border-dashed">
                                            Select a quiz to view questions
                                        </Card>
                                    ) : (
                                        <div className="bg-white rounded-[20px] shadow-sm ring-1 ring-gray-100 overflow-hidden">
                                            {filteredQuestions.map((q) => (
                                                <div
                                                    key={q.id}
                                                    className={`cursor-pointer transition-all p-5 border-b border-gray-100 last:border-b-0 ${selectedQuestion?.id === q.id
                                                        ? 'bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF]'
                                                        : 'bg-white hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSelectedQuestion(q)}
                                                >
                                                    <p className="line-clamp-2 font-medium text-[15px] text-gray-900">{q.question_text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Preview */}
                        <div className="lg:col-span-7 pt-[64px]">
                            {selectedQuestion ? (
                                <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl p-4 sm:p-6 bg-white">
                                    <CardHeader className="px-0 pt-0 pb-6">
                                        <CardTitle className="text-2xl sm:text-[26px] font-bold leading-tight text-gray-900">{selectedQuestion.question_text}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-0 pb-0 space-y-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-4 font-medium">Answer Options:</p>
                                            <div className="space-y-3">
                                                {['A', 'B', 'C', 'D'].map((letter, i) => {
                                                    const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                                                    const optionText = selectedQuestion[optionKey] as string;

                                                    const isCorrect =
                                                        selectedQuestion?.correct_option?.toLowerCase() === letter.toLowerCase();

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`p-4 sm:p-5 rounded-2xl border flex justify-between items-center transition
                                                                ${isCorrect
                                                                    ? 'bg-[#F2FBF5] border-[#B7E4C7]'
                                                                    : 'bg-[#F8F9FA] border-transparent'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold shrink-0
                                                                        ${isCorrect
                                                                            ? 'bg-[#22C55E] text-white'
                                                                            : 'bg-white text-gray-400 ring-1 ring-gray-200 shadow-sm'
                                                                        }`}
                                                                >
                                                                    {letter}
                                                                </div>
                                                                <span className={isCorrect ? "text-gray-900 font-medium text-[15px]" : "text-gray-500 font-medium text-[15px]"}>{optionText}</span>
                                                            </div>
                                                            {isCorrect && (
                                                                <span className="text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded text-xs font-semibold">
                                                                    Correct
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <Button
                                                onClick={handleEditClick}
                                                className="flex-1 bg-[#6366F1] hover:bg-[#5558E3] text-white rounded-xl py-6 text-base font-medium transition-colors"
                                                style={{ boxShadow: '0px 5.4px 8.1px -5.4px #AD46FF40, 0px 13.49px 20.24px -4.05px #AD46FF40' }}
                                            >
                                                Edit Question
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleDeleteClick}
                                                disabled={loading}
                                                className="text-base font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                                style={{
                                                    background: '#F9FAFB',
                                                    width: '107.95px',
                                                    height: '64.76px',
                                                    borderRadius: '18.89px',
                                                    opacity: 1
                                                }}
                                            >
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="h-full flex items-center justify-center py-20 text-center text-muted-foreground border-dashed bg-gray-50/50">
                                    Select a question from the left to preview
                                </Card>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <QuestionForm
                    isEditing={isEditing}
                    editingQuestionId={editingQuestionId}
                    selectedQuestion={selectedQuestion}
                    quizzes={quizzes}
                    initialQuizId={selectedQuizId}
                    onSuccess={(updatedQ) => {
                        if (isEditing && updatedQ) {
                            setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
                            setSelectedQuestion(updatedQ);
                        } else if (selectedQuizId) {
                            window.location.reload();
                        }
                        setShowAddForm(false);
                        setIsEditing(false);
                        setEditingQuestionId(null);
                    }}
                    onCancel={() => {
                        setShowAddForm(false);
                        setIsEditing(false);
                        setEditingQuestionId(null);
                    }}
                />
            )}

            {/* Bulk Upload Modal */}
            {showBulkForm && (
                <BulkUploadQuestionModal
                    quizzes={quizzes}
                    onClose={() => {
                        setShowBulkForm(false);
                        if (selectedQuizId) window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
