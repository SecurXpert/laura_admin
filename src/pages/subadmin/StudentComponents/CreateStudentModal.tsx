import React from 'react';
import { User, Mail, Lock } from 'lucide-react';

export interface NewStudent {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface CreateStudentModalProps {
  newStudent: NewStudent;
  setNewStudent: React.Dispatch<React.SetStateAction<NewStudent>>;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  newStudent,
  setNewStudent,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">
          Personal information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Basic student details
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-5 mt-6">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              placeholder="Enter your name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
              className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Enter your password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({ ...newStudent, password: e.target.value })
              }
              className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          className="px-6 py-2.5 rounded-lg text-white shadow-sm 
         bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
         hover:from-[#514EF0] hover:to-[#9333EA]
         transition"
        >
          Create Student
        </button>
      </div>
    </div>
  );
};

export default CreateStudentModal;
