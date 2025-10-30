import { useEffect, useState } from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 9);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-12 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-md text-center relative z-10">
        {/* Grid Pattern with Images */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl overflow-hidden relative transition-all duration-500 ${
                activeIndex === i 
                  ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent shadow-2xl shadow-white/50 scale-105' 
                  : 'ring-2 ring-white/20'
              }`}
              style={{
                transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* Image hoặc Fallback */}
              {!imageErrors[i] ? (
                <>
                  <img 
                    src={`/statics/${num}.jpg`}
                    alt={`User ${num}`}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      activeIndex === i ? 'brightness-125' : 'brightness-100'
                    }`}
                    onError={() => handleImageError(i)}
                  />
                  
                  {/* Glowing effect overlay khi active */}
                  {activeIndex === i && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{num}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-blue-100 text-lg leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;