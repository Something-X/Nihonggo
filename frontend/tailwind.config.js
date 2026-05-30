/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0f4ff',100:'#dbe4ff',200:'#bac8ff',300:'#91a7ff',400:'#748ffc',500:'#5c7cfa',600:'#4c6ef5',700:'#4263eb',800:'#3b5bdb',900:'#364fc7' },
        sakura: { 50:'#fff0f6',100:'#ffdeeb',200:'#fcc2d7',300:'#faa2c1',400:'#f783ac',500:'#f06595',600:'#e64980',700:'#d6336c',800:'#c2255c',900:'#a61e4d' },
        nihon: { 50:'#fff5f5',100:'#ffe3e3',200:'#ffc9c9',300:'#ffa8a8',400:'#ff8787',500:'#ff6b6b',600:'#fa5252',700:'#f03e3e',800:'#e03131',900:'#c92a2a' },
        dark: { 800:'#1a1b2e',850:'#151625',900:'#0f1019',950:'#0a0b12' },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'pulse-fast': 'pulse 0.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'fire': 'fire 0.3s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shake: { '0%,100%':{transform:'translateX(0)'},'10%,30%,50%,70%,90%':{transform:'translateX(-4px)'},'20%,40%,60%,80%':{transform:'translateX(4px)'} },
        slideUp: { '0%':{transform:'translateY(20px)',opacity:'0'},'100%':{transform:'translateY(0)',opacity:'1'} },
        slideDown: { '0%':{transform:'translateY(-20px)',opacity:'0'},'100%':{transform:'translateY(0)',opacity:'1'} },
        fadeIn: { '0%':{opacity:'0'},'100%':{opacity:'1'} },
        bounceIn: { '0%':{transform:'scale(0.3)',opacity:'0'},'50%':{transform:'scale(1.05)'},'70%':{transform:'scale(0.9)'},'100%':{transform:'scale(1)',opacity:'1'} },
        fire: { '0%':{boxShadow:'0 0 20px #ff6b6b, 0 0 40px #ff4757'},'100%':{boxShadow:'0 0 30px #ff4757, 0 0 60px #ff6b6b'} },
        glow: { '0%':{boxShadow:'0 0 5px #5c7cfa, 0 0 10px #5c7cfa'},'100%':{boxShadow:'0 0 20px #5c7cfa, 0 0 40px #5c7cfa'} },
      }
    },
  },
  plugins: [],
}
