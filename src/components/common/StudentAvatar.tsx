import React, { useRef, useState } from 'react';
import { Pencil, Camera, Loader2 } from 'lucide-react';
import { Student } from '../../types';
import { useEmulation } from '../../context/EmulationContext';

interface StudentAvatarProps {
  student: Student;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  allowEdit?: boolean;
  className?: string;
  shape?: 'rounded' | 'circle';
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  size = 'md',
  allowEdit = false,
  className = '',
  shape = 'rounded',
}) => {
  const { updateStudentAvatar, addToast } = useEmulation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Size styling classes
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl',
  };

  const roundedClasses = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  // Pencil button sizing based on avatar size
  const editButtonSizes = {
    xs: 'w-4 h-4 p-0.5 -bottom-1 -right-1',
    sm: 'w-5 h-5 p-1 -bottom-1 -right-1',
    md: 'w-6 h-6 p-1.5 -bottom-1 -right-1',
    lg: 'w-7 h-7 sm:w-8 sm:h-8 p-1.5 sm:p-2 -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5',
    xl: 'w-8 h-8 p-2 -bottom-1 -right-1',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-4 h-4',
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Định dạng không hợp lệ', 'Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp)');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize & compress with canvas to maintain high quality while keeping Base64 compact
        const maxDimension = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          updateStudentAvatar(student.maHS, compressedBase64);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        addToast('error', 'Lỗi ảnh', 'Không thể đọc dữ liệu file ảnh này');
      };
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      addToast('error', 'Lỗi đọc file', 'Không thể đọc file từ thiết bị');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {/* Avatar Container */}
      <div
        className={`${sizeClasses[size]} ${roundedClasses} overflow-hidden font-black flex items-center justify-center select-none shadow-xs border border-white/30 transition-transform ${
          student.avatar
            ? 'bg-slate-100'
            : student.gioiTinh === 'nu'
            ? 'bg-pink-100 text-pink-700'
            : 'bg-blue-100 text-blue-700'
        }`}
      >
        {student.avatar ? (
          <img
            src={student.avatar}
            alt={student.hoTen}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{student.hoTen.charAt(0)}</span>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Edit Pencil Button */}
      {allowEdit && (
        <>
          <button
            type="button"
            onClick={handleEditClick}
            disabled={isProcessing}
            title={`Thay đổi ảnh đại diện của ${student.hoTen}`}
            className={`absolute ${editButtonSizes[size]} bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-red-600 rounded-full shadow-md border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer z-10`}
            aria-label="Thay đổi ảnh đại diện"
          >
            <Pencil className={`${iconSizes[size]} stroke-[2.5]`} />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};
