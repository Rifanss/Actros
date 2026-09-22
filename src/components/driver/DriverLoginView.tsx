import React, { useState } from 'react';
import { Truck, Lock, User, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useWaterData } from '../../context/WaterDataContext';

export const DriverLoginView: React.FC = () => {
  const { loginDriver, setActiveTab, drivers } = useWaterData();

  const [username, setUsername] = useState('كريم');
  const [password, setPassword] = useState('123456');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginDriver(username, password);
      setIsLoading(false);

      if (result.success) {
        setActiveTab('driver_portal');
      } else {
        setErrorMessage(result.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    }, 200);
  };

  const handleSelectQuickDriver = (driverUsername: string) => {
    setUsername(driverUsername);
    setPassword('123456');
    setErrorMessage(null);
  };

  const driverAccounts = [
    { name: 'كريم', vehicle: 'وايت سكس تحلية (18 طن)' },
    { name: 'غلام', vehicle: 'تريلا تحلية (30 طن)' },
    { name: 'أحمد', vehicle: 'وايت سكس تحلية (18 طن)' },
    { name: 'مختار تريلا', vehicle: 'تريلا آبار (30 طن)' },
    { name: 'مختار عايدي', vehicle: 'وايت عايدي آبار (12 طن)' },
  ];

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-sky-50/60 via-slate-50 to-white"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Top Decorative Brand Banner */}
        <div className="bg-[#03457a] text-white p-6 sm:p-7 text-center relative overflow-hidden">
          {/* Subtle Water/Circle Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-sky-400/10 pointer-events-none" />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-3 shadow-inner">
            <Truck className="w-8 h-8 text-sky-200" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Tajawal',sans-serif]">
            نبع لتوريد المياه
          </h1>
          <p className="text-xs text-sky-200 mt-1 font-medium">
            بوابة دخول السائقين وتوثيق التوريدات
          </p>
        </div>

        {/* Login Form Container */}
        <div className="p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">دخول السائق</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              سجّل دخولك للوصول إلى طلبات التوريد المسندة لحسابك وتوثيقها
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم (مثال: كريم)"
                  className="w-full text-xs pr-10 pl-3 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03457a] focus:ring-1 focus:ring-[#03457a] font-medium transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full text-xs pr-10 pl-3 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03457a] focus:ring-1 focus:ring-[#03457a] font-mono transition"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#03457a] hover:bg-[#023561] text-white font-bold text-sm rounded-xl shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <Truck className="w-4 h-4" />
              <span>{isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Select Testing Helpers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600">
                حسابات السائقين المعتمدة (للتجربة السريعة):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">كلمة المرور: 123456</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {driverAccounts.map((acc) => {
                const isSelected = username === acc.name;
                return (
                  <button
                    key={acc.name}
                    type="button"
                    onClick={() => handleSelectQuickDriver(acc.name)}
                    className={`text-right p-2 rounded-lg border text-[10.5px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold'
                        : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{acc.name}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-sky-700" />}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{acc.vehicle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Return link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-xs text-sky-700 hover:text-sky-900 font-bold inline-flex items-center gap-1 transition cursor-pointer"
            >
              <span>العودة إلى لوحة الإدارة / الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
