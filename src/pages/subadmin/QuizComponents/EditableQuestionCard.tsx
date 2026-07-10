import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

export interface EditableQuestionCardRef {
  save: () => Promise<void>;
  hasChanges: () => boolean;
}

export const EditableQuestionCard = forwardRef<EditableQuestionCardRef, { question: any, onUpdate: () => void }>(({ question, onUpdate }, ref) => {
  const [loading, setLoading] = useState(false);
  const [qText, setQText] = useState(question.question_text || '');
  const [correctOption, setCorrectOption] = useState(question.correct_option?.toLowerCase() || '');
  
  const [opts, setOpts] = useState({
    option_a: question.option_a || '',
    option_b: question.option_b || '',
    option_c: question.option_c || '',
    option_d: question.option_d || '',
  });

  const handleUpdateQuestion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('question_text', qText);
      formData.append('correct_option', correctOption);
      formData.append('quiz_id', String(question.quiz_id));
      
      let updateFailed = false;
      const res = await fetch(`${BASE_URL}/subadmin/questions/${question.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        // Fallback to JSON
        const resJson = await fetch(`${BASE_URL}/subadmin/questions/${question.id}`, {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            quiz_id: question.quiz_id,
            question_text: qText,
            correct_option: correctOption,
            option_a: opts.option_a,
            option_b: opts.option_b,
            option_c: opts.option_c,
            option_d: opts.option_d,
          })
        });
        if (!resJson.ok) updateFailed = true;
      }
      if (updateFailed) throw new Error('Failed to update question text');
      
      for (const letter of ['a', 'b', 'c', 'd']) {
        const key = `option_${letter}`;
        const val = opts[key as keyof typeof opts];
        if (val !== question[key]) {
          const optFormData = new URLSearchParams();
          optFormData.append('option_value', val);
          
          await fetch(`${BASE_URL}/subadmin/questions/${question.id}/options/${letter}`, {
             method: 'PATCH',
             headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/x-www-form-urlencoded'
             },
             body: optFormData
          });
        }
      }
      toast({
        title: "Updated",
        description: "Question updated successfully",
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
      onUpdate();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error updating question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (qText !== (question.question_text || '')) return true;
    if (correctOption !== (question.correct_option?.toLowerCase() || '')) return true;
    if (opts.option_a !== (question.option_a || '')) return true;
    if (opts.option_b !== (question.option_b || '')) return true;
    if (opts.option_c !== (question.option_c || '')) return true;
    if (opts.option_d !== (question.option_d || '')) return true;
    return false;
  };

  useImperativeHandle(ref, () => ({
    save: handleUpdateQuestion,
    hasChanges
  }));

  const handleUpdateOption = async (letter: string) => {
    const key = `option_${letter}`;
    const val = opts[key as keyof typeof opts];
    if (val === question[key]) {
      toast({
        title: "Info",
        description: "No changes made to this option",
      });
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const optFormData = new URLSearchParams();
      optFormData.append('option_value', val);
      
      const res = await fetch(`${BASE_URL}/subadmin/questions/${question.id}/options/${letter}`, {
         method: 'PATCH',
         headers: {
           Authorization: `Bearer ${token}`,
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: optFormData
      });
      if (!res.ok) throw new Error('Failed to update option');
      toast({
        title: "Updated",
        description: `Option ${letter.toUpperCase()} updated successfully`,
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
      onUpdate();
    } catch(err: any) {
      toast({
        title: "Error",
        description: err.message || "Error updating option",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/subadmin/questions/${question.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete question');
      toast({
        title: "Deleted",
        description: "Question deleted successfully",
        className: "bg-red-500 text-white",
        duration: 2000,
      });
      onUpdate();
    } catch(err: any) {
      toast({
        title: "Error",
        description: err.message || "Error deleting question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Question Text</label>
        <Textarea 
          value={qText} 
          onChange={(e) => setQText(e.target.value)} 
          className="mt-1"
        />
      </div>
      <div className="space-y-3">
        {(['a', 'b', 'c', 'd'] as const).map(letter => (
          <div key={letter} className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
             <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold uppercase">{letter}</div>
             <Input 
               value={opts[`option_${letter}`]} 
               onChange={(e) => setOpts({...opts, [`option_${letter}`]: e.target.value})}
               className="flex-1"
             />
             <div className="flex items-center gap-3">
               <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600">
                 <input 
                   type="radio"
                   name={`correct_${question.id}`}
                   checked={correctOption === letter}
                   onChange={() => setCorrectOption(letter)}
                   className="w-4 h-4 text-indigo-600 cursor-pointer"
                 />
                 Correct
               </label>
               <Button 
                 type="button" 
                 size="sm" 
                 variant="outline"
                 onClick={() => handleUpdateOption(letter)}
                 disabled={loading || opts[`option_${letter}`] === question[`option_${letter}`]}
                 className="text-xs h-8"
               >
                 Update Option
               </Button>
             </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="destructive" 
          onClick={handleDeleteQuestion} 
          disabled={loading} 
          className="shadow-md transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete Question
        </Button>
        <Button 
          type="button" 
          onClick={handleUpdateQuestion} 
          disabled={loading || !hasChanges()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
          Update Full Question
        </Button>
      </div>
    </div>
  );
});
