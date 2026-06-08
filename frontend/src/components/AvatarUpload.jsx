import { useState, useRef } from 'react';

export default function AvatarUpload({ currentAvatar, onSave, size = 'lg' }) {
  const [preview, setPreview] = useState(currentAvatar || '');
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200000) {
      alert('Image must be less than 200KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setPreview(base64);
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(avatar);
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizes[size]} rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition`}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
            ?
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Change
        </button>
        {avatar && avatar !== currentAvatar && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-green-600 hover:text-green-800 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}