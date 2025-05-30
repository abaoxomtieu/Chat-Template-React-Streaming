export const arenaStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
    50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
  
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-shake { animation: shake 0.5s ease-in-out infinite; }
  
  .arena-border {
    border-image: linear-gradient(45deg, #ffd700, #ff4500, #8b00ff, #ffd700) 1;
  }
  
  .combat-glow {
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.3),
      0 0 40px rgba(255, 69, 0, 0.2),
      0 0 60px rgba(139, 0, 255, 0.1);
  }
  
  .combat-select {
    position: relative;
    width: 100%;
  }
  
  .combat-select select {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .combat-select.left select {
    border-color: #06b6d4;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
  }
  
  .combat-select.left select:hover,
  .combat-select.left select:focus {
    border-color: #0891b2;
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
    background: rgba(6, 182, 212, 0.1);
  }
  
  .combat-select.right select {
    border-color: #f87171;
    box-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
  }
  
  .combat-select.right select:hover,
  .combat-select.right select:focus {
    border-color: #ef4444;
    box-shadow: 0 0 20px rgba(248, 113, 113, 0.5);
    background: rgba(248, 113, 113, 0.1);
  }
  
  .combat-select select option {
    background: #1f2937;
    color: white;
    padding: 8px;
  }
`;

export const combatBackgrounds = {
  main: `
    radial-gradient(circle at 30% 70%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, 
      #0c0c0c 0%, 
      #1a1a2e 25%, 
      #16213e 75%, 
      #533483 100%
    )`,
  arena: `
    radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, 
      #1a1a2e 0%, 
      #16213e 25%, 
      #0f3460 50%, 
      #533483 75%, 
      #e94560 100%
    )`
}; 