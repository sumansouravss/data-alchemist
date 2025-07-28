// ✅ DarkModeToggle.tsx with styled button and working icon
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const newTheme = !isDark;
    setIsDark(newTheme);
    root.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleDarkMode}
        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
        <span className="text-sm font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>
    </div>
  );
};

export default DarkModeToggle;
