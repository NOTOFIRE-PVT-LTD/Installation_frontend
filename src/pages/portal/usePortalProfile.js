import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { changePassword, updateProfile } from '../../features/auth/authThunks';

async function saveProfileParts(dispatch, { name, mobileNumber, imageFile, removeImage, pwd }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('mobileNumber', mobileNumber);
  if (imageFile) formData.append('profileImage', imageFile);
  else if (removeImage) formData.append('removeProfileImage', 'true');
  await dispatch(updateProfile(formData)).unwrap();

  if (!pwd.new) return;
  await dispatch(
    changePassword({ currentPassword: pwd.current, newPassword: pwd.new }),
  ).unwrap();
}

export function usePortalProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const fileRef = useRef(null);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobileNumber || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState(user?.profileImage?.url || '');
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const initial = (name || user?.email || 'U').trim().charAt(0).toUpperCase();

  function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2_500_000) {
      setMsg('Image must be under 2.5 MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setMsg(null);
  }

  function onRemovePhoto() {
    setImageFile(null);
    setPreview('');
    setRemoveImage(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    if (newPwd || confirmPwd) {
      if (!currentPwd) {
        setMsg('Enter current password to change it');
        return;
      }
      if (newPwd.length < 8) {
        setMsg('Password must be at least 8 characters');
        return;
      }
      if (newPwd !== confirmPwd) {
        setMsg('Passwords do not match');
        return;
      }
    }
    setSaving(true);
    try {
      await saveProfileParts(dispatch, {
        name: name.trim(),
        mobileNumber: mobile.trim(),
        imageFile,
        removeImage,
        pwd: { current: currentPwd, new: newPwd.trim() },
      });
      setImageFile(null);
      setRemoveImage(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setMsg('Saved.');
    } catch (err) {
      setMsg(typeof err === 'string' ? err : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  return {
    email: user?.email || '',
    initial,
    name,
    setName,
    mobile,
    setMobile,
    currentPwd,
    setCurrentPwd,
    newPwd,
    setNewPwd,
    confirmPwd,
    setConfirmPwd,
    preview,
    fileRef,
    onPickFile,
    onRemovePhoto,
    msg,
    saving,
    onSubmit,
  };
}
