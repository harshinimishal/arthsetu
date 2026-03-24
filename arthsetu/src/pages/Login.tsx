import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary font-bold text-3xl">
              A
            </div>
            <h1 className="text-5xl font-bold tracking-tighter">ArthSetu</h1>
          </div>
          <h2 className="text-4xl font-light leading-tight">
            The <span className="font-bold italic">Tactile Bridge</span> to your financial professional growth.
          </h2>
          <p className="text-white/70 text-lg">
            Empowering contractors and service partners with real-time financial insights and seamless worker management.
          </p>
          
          <div className="pt-10 flex gap-8">
            <div>
              <p className="text-3xl font-bold">15k+</p>
              <p className="text-sm text-white/60">Active Partners</p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹500Cr+</p>
              <p className="text-sm text-white/60">Processed Payouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-on-surface">Welcome Back</h3>
            <p className="text-on-surface-variant">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-on-surface">Password</label>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm text-on-surface-variant">Remember me for 30 days</label>
            </div>

            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20">
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-on-surface-variant font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-outline/10 rounded-2xl hover:bg-surface-container transition-all font-medium">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-outline/10 rounded-2xl hover:bg-surface-container transition-all font-medium">
              <Globe className="w-5 h-5 text-blue-600" />
              Microsoft
            </button>
          </div>

          <p className="text-center text-on-surface-variant">
            Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
