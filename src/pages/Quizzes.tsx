import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, FileQuestion, Search, BarChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Quiz {
  id: number;
  title: string;
  questions: number;
  createdDate: string;
  status: string;
}

interface QuizResult {
  id: number;
  guest_id: number;
  title: string;
  score: number;
  total_questions: number;
  time_taken: number;
  submitted_at: string;
  name: string;
}
const courseTopics = [
  ["HTML", "CSS", "Figma"],
  ["React", "Hooks", "Redux"],
  ["Python", "OOP", "Modules"],
  ["Java", "Spring", "Hibernate"],
  ["NodeJS", "Express", "APIs"],
  ["SQL", "Joins", "Normalization"],
  ["AWS", "Docker", "CI/CD"],
  ["JavaScript", "JavaFX", "SpringBoot"],
];
const Quizzes = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDescription, setNewQuizDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogQuizTitle, setDialogQuizTitle] = useState("");
  const [dialogQuizDescription, setDialogQuizDescription] = useState("");

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch("https://lauratek.in:8000/guest/admin-view/quiz_listing", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();
      const mappedQuizzes: Quiz[] = data.map((item: { quiz_title: string; no_of_questions: number; created_at: string }, index: number) => ({
        id: index + 1,
        title: item.quiz_title,
        questions: item.no_of_questions,
        createdDate: new Date(item.created_at).toISOString().split('T')[0],
        status: "Draft",
      }));

      setQuizzes(mappedQuizzes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quizzes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch quiz results from API
  const fetchQuizResults = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch("https://lauratek.in:8000/guest/admin-view-quiz/results", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz results");
      }

      const data = await response.json();
      const mappedResults: QuizResult[] = data.map((item: QuizResult) => ({
        id: item.id,
        guest_id: item.guest_id,
        title: item.title,
        score: item.score,
        total_questions: item.total_questions,
        time_taken: item.time_taken,
        submitted_at: new Date(item.submitted_at).toISOString().split('T')[0],
        name: item.name,
      }));

      setResults(mappedResults);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz results. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch quizzes and results on component mount
  useEffect(() => {
    fetchQuizzes();
    fetchQuizResults();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuiz = async () => {
    if (!dialogQuizTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch("https://lauratek.in:8000/admin/guest-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: dialogQuizTitle,
          description: dialogQuizDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create quiz");
      }

      const responseData = await response.json();
      const newQuiz: Quiz = {
        id: responseData.id || Date.now(),
        title: dialogQuizTitle,
        questions: 0,
        createdDate: new Date().toISOString().split('T')[0],
        status: "Draft",
      };

      setQuizzes([...quizzes, newQuiz]);
      setDialogQuizTitle("");
      setDialogQuizDescription("");
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuiz = async (id: number, title: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch(`https://lauratek.in:8000/admin/guest-quiz/quiz/${encodeURIComponent(title)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      toast({
        title: "Success",
        description: "Quiz deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected. Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (!newQuizTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title before uploading the CSV file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', newQuizTitle);

      const response = await fetch("https://lauratek.in:8000/admin/guest-quiz/upload-mcq-csv", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CSV file");
      }

      toast({
        title: "Success",
        description: `CSV file "${file.name}" uploaded successfully for quiz "${newQuizTitle}"!`,
        variant: "default",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setNewQuizTitle("");
      setNewQuizDescription("");
      await fetchQuizzes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <p className="text-muted-foreground">Create, manage, and organize your course quizzes</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
             <div className="space-y-2">
  <Label htmlFor="quiz-title">Quiz Title</Label>
  <select
    id="quiz-title"
    className="border rounded px-3 py-2 w-full"
    value={dialogQuizTitle}
    onChange={(e) => setDialogQuizTitle(e.target.value)}
  >
    <option value="" disabled>Select quiz topic</option>
    {courseTopics.map((group, index) => (
      <optgroup key={index} label={`Group ${index + 1}`}>
        {group.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
</div>
              <div className="space-y-2">
                <Label htmlFor="quiz-description">Description</Label>
                <Textarea
                  id="quiz-description"
                  placeholder="Enter quiz description (optional)"
                  value={dialogQuizDescription}
                  onChange={(e) => setDialogQuizDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddQuiz}>Create Quiz</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Input
          placeholder="Enter quiz title for CSV upload"
          value={newQuizTitle}
          onChange={(e) => setNewQuizTitle(e.target.value)}
          className="w-full sm:w-1/3"
        />
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={triggerFileInput}
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </Button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            All Quizzes ({filteredQuizzes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.questions} questions</TableCell>
                  <TableCell>{quiz.createdDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quiz Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Quiz Results ({results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Total Questions</TableHead>
                <TableHead>Time Taken (s)</TableHead>
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell>{result.title}</TableCell>
                  <TableCell>{result.score}</TableCell>
                  <TableCell>{result.total_questions}</TableCell>
                  <TableCell>{result.time_taken}</TableCell>
                  <TableCell>{result.submitted_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quizzes;