import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FileText, ListOrdered, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// ─── Config ────────────────────────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Question {
    id: number;
    quiz_id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    file_url?: string | null;
    correct_option: string;
}

export interface Quiz {
    id: number;
    title: string;
    course_id?: number;
}

interface QuestionFormData {
    quiz_id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    trainer_id: string;
    integer_id?: string;
}

interface QuestionFormProps {
    isEditing: boolean;
    editingQuestionId: number | null;
    selectedQuestion: Question | null;
    quizzes: Quiz[];
    initialQuizId?: string;
    onSuccess: (updatedQuestion?: Question) => void;
    onCancel: () => void;
}

export default function QuestionForm({
    isEditing,
    editingQuestionId,
    selectedQuestion,
    quizzes,
    initialQuizId,
    onSuccess,
    onCancel,
}: QuestionFormProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<QuestionFormData>({
        quiz_id: selectedQuestion ? selectedQuestion.quiz_id.toString() : (initialQuizId || ''),
        question_text: selectedQuestion ? selectedQuestion.question_text : '',
        option_a: selectedQuestion ? selectedQuestion.option_a : '',
        option_b: selectedQuestion ? selectedQuestion.option_b : '',
        option_c: selectedQuestion ? selectedQuestion.option_c : '',
        option_d: selectedQuestion ? selectedQuestion.option_d : '',
        correct_option: selectedQuestion ? selectedQuestion.correct_option : '',
        trainer_id: '',
        integer_id: '',
    });

    useEffect(() => {
        if (isEditing && selectedQuestion) {
            setFormData({
                quiz_id: selectedQuestion.quiz_id.toString(),
                question_text: selectedQuestion.question_text,
                option_a: selectedQuestion.option_a,
                option_b: selectedQuestion.option_b,
                option_c: selectedQuestion.option_c,
                option_d: selectedQuestion.option_d,
                correct_option: selectedQuestion.correct_option,
                trainer_id: '',
                integer_id: '',
            });
        } else if (!isEditing) {
            setFormData((prev) => ({ ...prev, quiz_id: initialQuizId || prev.quiz_id }));
        }
    }, [isEditing, selectedQuestion, initialQuizId]);

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: keyof QuestionFormData) => (value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !formData.quiz_id.trim() ||
            !formData.question_text.trim() ||
            !formData.option_a.trim() ||
            !formData.option_b.trim() ||
            !formData.option_c.trim() ||
            !formData.option_d.trim() ||
            !formData.correct_option ||
            (!isEditing && !formData.trainer_id.trim())
        ) {
            toast.error('Please fill all required fields');
            return;
        }

        const correct = formData.correct_option.toLowerCase().trim();
        if (!['a', 'b', 'c', 'd'].includes(correct)) {
            toast.error('Correct option must be A, B, C or D');
            return;
        }

        setLoading(true);

        try {
            const token = getAccessToken();
            if (!token) {
                toast.error('No authentication token');
                navigate('/login');
                return;
            }

            const url = isEditing
                ? `${API_BASE_URL}/subadmin/questions/${editingQuestionId}`
                : `${API_BASE_URL}/subadmin/questions`;

            let response;
            if (isEditing) {
                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quiz_id: Number(formData.quiz_id),
                        question_text: formData.question_text.trim(),
                        option_a: formData.option_a.trim(),
                        option_b: formData.option_b.trim(),
                        option_c: formData.option_c.trim(),
                        option_d: formData.option_d.trim(),
                        correct_option: correct
                    }),
                });
            } else {
                const payload = new FormData();
                payload.append('quiz_id', formData.quiz_id.trim());
                payload.append('question_text', formData.question_text.trim());
                payload.append('option_a', formData.option_a.trim());
                payload.append('option_b', formData.option_b.trim());
                payload.append('option_c', formData.option_c.trim());
                payload.append('option_d', formData.option_d.trim());
                payload.append('correct_option', correct);
                payload.append('trainer_id', formData.trainer_id.trim());
                if (formData.integer_id?.trim()) payload.append('integer_id', formData.integer_id.trim());

                response = await fetch(url, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: payload,
                });
            }

            const result = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error(result.message || (isEditing ? 'Failed to update question' : 'Failed to add question'));

            toast.success(isEditing ? 'Question updated successfully!' : 'Question added successfully!');

            if (isEditing && editingQuestionId && selectedQuestion) {
                const updatedQuestion: Question = {
                    ...selectedQuestion,
                    id: editingQuestionId,
                    quiz_id: Number(formData.quiz_id),
                    question_text: formData.question_text.trim(),
                    option_a: formData.option_a.trim(),
                    option_b: formData.option_b.trim(),
                    option_c: formData.option_c.trim(),
                    option_d: formData.option_d.trim(),
                    correct_option: correct
                };
                onSuccess(updatedQuestion);
            } else {
                onSuccess();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col space-y-6 pb-12">
            <Button variant="ghost" onClick={onCancel} type="button" className="w-fit text-muted-foreground hover:text-gray-900 mb-2 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Question' : 'Add Question'}</h2>
                    <p className="text-muted-foreground mt-1">{isEditing ? 'Update your question details' : 'Create a new question for quizzes'}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" type="button" onClick={onCancel} className="text-gray-500 font-medium h-[45px] px-6">Cancel</Button>
                    <Button
                        type="submit"
                        form="add-question-form"
                        className="flex items-center gap-2 text-white h-[45px] px-6 rounded-xl font-medium transition-opacity hover:opacity-90 border-none"
                        style={{
                            background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                            boxShadow: '0px 5.4px 8.1px -5.4px #AD46FF40, 0px 13.49px 20.24px -4.05px #AD46FF40'
                        }}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Question' : 'Save Question'}
                    </Button>
                </div>
            </div>

            <form id="add-question-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                <div className="space-y-6">
                    {/* Question Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                Question Details
                            </CardTitle>
                            <CardDescription>Question text and quiz selection</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Select Quiz *</Label>
                                <Select value={formData.quiz_id} onValueChange={handleSelectChange('quiz_id')}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Select Quiz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quizzes.map((q) => (
                                            <SelectItem key={q.id} value={q.id.toString()}>{q.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <input
                                type="hidden"
                                name="trainer_id"
                                value={formData.trainer_id}
                                onChange={handleTextChange}
                            />

                            {!isEditing && (
                                <div className="pt-4">
                                    <Label>Trainer ID *</Label>
                                    <Input
                                        type="number"
                                        name="trainer_id"
                                        value={formData.trainer_id}
                                        onChange={handleTextChange}
                                        placeholder="Enter Trainer ID"
                                        required={!isEditing}
                                        className="max-w-xs"
                                    />
                                </div>
                            )}

                            <div>
                                <Label>Question *</Label>
                                <Textarea
                                    name="question_text"
                                    value={formData.question_text}
                                    onChange={handleTextChange}
                                    placeholder="Enter your question here..."
                                    rows={5}
                                    className="mt-1.5"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answer Options Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <ListOrdered className="w-4 h-4 text-purple-600" />
                                </div>
                                Answer Options
                            </CardTitle>
                            <CardDescription>Provide multiple choice answers and select the correct option</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(['a', 'b', 'c', 'd'] as const).map((letter) => (
                                <div key={letter} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="font-semibold w-6 text-center">{letter.toUpperCase()}</div>
                                    <Input
                                        name={`option_${letter}`}
                                        value={formData[`option_${letter}`]}
                                        onChange={handleTextChange}
                                        placeholder={`Option ${letter.toUpperCase()}`}
                                        className="flex-1"
                                        required
                                    />
                                    <div className="flex items-center gap-2 pl-2">
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            value={letter}
                                            checked={formData.correct_option === letter}
                                            onChange={(e) => handleSelectChange('correct_option')(e.target.value)}
                                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-2">
                                <span className="text-blue-600 font-bold">•</span>
                                Select the radio button next to the option to mark it as the correct answer
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
