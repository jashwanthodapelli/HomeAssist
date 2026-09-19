import React, { useState } from 'react';
import { HardHat, Briefcase, MapPin, IndianRupee, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { workerService, uploadService } from '../../services';

export const WorkerProfileEditPage: React.FC = () => {
  const { worker, setWorkerProfile } = useAuth();
  const { showToast } = useNotification();

  const [profession, setProfession] = useState(worker?.profession || '');
  const [experience, setExperience] = useState(worker?.experience || 3);
  const [servicesInput, setServicesInput] = useState((worker?.services || []).join(', '));
  const [skillsInput, setSkillsInput] = useState((worker?.skills || []).join(', '));
  const [city, setCity] = useState(worker?.city || 'Bangalore');
  const [serviceArea, setServiceArea] = useState(worker?.serviceArea || '');
  const [hourlyRate, setHourlyRate] = useState(worker?.hourlyRate || 350);
  const [about, setAbout] = useState(worker?.about || '');
  const [profileImage, setProfileImage] = useState(worker?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingImage(true);
        const res = await uploadService.uploadImage(file);
        if (res.success) {
          setProfileImage(res.url);
          showToast('Profile photo uploaded!', 'success');
        }
      } catch {
        showToast('Failed to upload image', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        profession,
        experience: Number(experience),
        services: servicesInput.split(',').map((s) => s.trim()).filter(Boolean),
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        city,
        serviceArea,
        hourlyRate: Number(hourlyRate),
        about,
        profileImage,
      };

      const res = await workerService.updateWorkerProfile(payload);
      if (res.success) {
        showToast('Worker profile updated successfully!', 'success');
        if (res.worker) setWorkerProfile(res.worker);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Worker Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Keep your professional skills, visiting charges, and coverage areas updated
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <img
            src={
              profileImage ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker?.name || 'Worker')}`
            }
            alt="Worker Avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
          />
          <div>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload New Photo'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">Recommended square JPG or PNG under 5MB</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Profession / Title</label>
            <input
              type="text"
              required
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Master Electrician & Inverter Specialist"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Visit Rate (₹)</label>
              <input
                type="number"
                min={50}
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Services Offered (Comma-separated)</label>
            <input
              type="text"
              required
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="e.g. MCB Tripping Fix, Switchboard Installation, Ceiling Fan Repair"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialized Skills / Tools</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Thermal Imaging, Multimeter Testing, Inverter Troubleshooting"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Localities / Areas</label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Indiranagar, Koramangala, Domlur"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">About Your Work</label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Provide a brief summary of your service quality, guarantee, or background..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
