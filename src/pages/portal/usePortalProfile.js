import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { changePassword, updateProfile } from '../../features/auth/authThunks';

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
  const [infoMsg, setInfoMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const initial = (name || user?.email || 'U').trim().charAt(0).toUpperCase();

  // Keep preview in sync after save/reload (e.g. photo removed → letter avatar).
  useEffect(() => {
    if (imageFile) return;
    setPreview(user?.profileImage?.url || '');
    setRemoveImage(false);
  }, [user?.profileImage?.url, imageFile]);

  function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2_500_000) {
      setInfoMsg('Image must be under 2.5 MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setInfoMsg(null);
  }

  function onRemovePhoto() {
    setImageFile(null);
    setPreview('');
    setRemoveImage(true);
  }

  async function onSaveInfo(e) {
    e.preventDefault();
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('mobileNumber', mobile.trim());
      if (imageFile) formData.append('profileImage', imageFile);
      else if (removeImage) formData.append('removeProfileImage', 'true');
      await dispatch(updateProfile(formData)).unwrap();
      setImageFile(null);
      setRemoveImage(false);
      setInfoMsg('Profile updated.');
    } catch (err) {
      setInfoMsg(typeof err === 'string' ? err : 'Could not save profile');
    } finally {
      setSavingInfo(false);
    }
  }

  async function onSavePassword(e) {
    e.preventDefault();
    setPwdMsg(null);
    if (!currentPwd || newPwd.length < 8 || newPwd !== confirmPwd) {
      setPwdMsg(
        !currentPwd
          ? 'Enter current password'
          : newPwd.length < 8
            ? 'Password must be at least 8 characters'
            : 'Passwords do not match',
      );
      return;
    }
    setSavingPwd(true);
    try {
      await dispatch(
        changePassword({ currentPassword: currentPwd, newPassword: newPwd }),
      ).unwrap();
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdMsg('Password changed.');
    } catch (err) {
      setPwdMsg(typeof err === 'string' ? err : 'Could not change password');
    } finally {
      setSavingPwd(false);
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
    removeImage,
    fileRef,
    onPickFile,
    onRemovePhoto,
    infoMsg,
    pwdMsg,
    savingInfo,
    savingPwd,
    onSaveInfo,
    onSavePassword,
  };
}
