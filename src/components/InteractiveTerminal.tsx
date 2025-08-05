import { useState, useEffect, useRef } from "react";
import { parseAnsiColors } from "./terminal/utils.tsx";

interface CommandHistory {
  command: string;
  output: string[];
  timestamp: Date;
}

const InteractiveTerminal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Auto-scroll to bottom when new commands are added
    if (terminalRef.current) {
      const scrollElement = terminalRef.current.querySelector('.terminal-content');
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 10);
      }
    }
  }, [commandHistory]);

  useEffect(() => {
    // Also scroll when input changes (real terminal behavior)
    if (terminalRef.current) {
      const scrollElement = terminalRef.current.querySelector('.terminal-content');
      if (scrollElement && currentInput) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 10);
      }
    }
  }, [currentInput]);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (!trimmedCmd) return;

    const timestamp = new Date();

    if (trimmedCmd === 'clear') {
      setCommandHistory([]);
      setCurrentInput("");
      setHistoryIndex(-1);
      setIsTyping(false);
      return;
    }

    if (trimmedCmd === 'exit') {
      setIsLoggedIn(false);
      setCommandHistory([]);
      setCurrentInput("");
      setHistoryIndex(-1);
      setIsTyping(false);
      return;
    }

    const { commands } = await import("./terminal/commands");

    if (commands[trimmedCmd as keyof typeof commands]) {
      const output = commands[trimmedCmd as keyof typeof commands]();
      setCommandHistory(prev => {
        const newHistory = [...prev, { command: cmd, output, timestamp }];
        // Force scroll after state update
        setTimeout(() => {
          if (terminalRef.current) {
            const scrollElement = terminalRef.current.querySelector('.terminal-content');
            if (scrollElement) {
              scrollElement.scrollTop = scrollElement.scrollHeight;
            }
          }
        }, 50);
        return newHistory;
      });
    } else {
      setCommandHistory(prev => {
        const newHistory = [...prev, {
          command: cmd,
          output: [
            `bash: ${cmd}: command not found`,
            "",
            "Type 'help' to see available commands."
          ],
          timestamp
        }];
        // Force scroll after state update
        setTimeout(() => {
          if (terminalRef.current) {
            const scrollElement = terminalRef.current.querySelector('.terminal-content');
            if (scrollElement) {
              scrollElement.scrollTop = scrollElement.scrollHeight;
            }
          }
        }, 50);
        return newHistory;
      });
    }

    setCurrentInput("");
    setHistoryIndex(-1);
    setIsTyping(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCommandHistory([
      {
        command: "login",
        output: [
          "Welcome to MoonShadow Terminal v2.0",
          "",
          "Last login: " + new Date().toLocaleString(),
          "System: ArchLinux MoonShadow-Edition",
          "Kernel: 6.1.0-enhanced-security",
          "",
          "Type 'help' to see available commands.",
          "Use Ctrl+C to cancel current input.",
          ""
        ],
        timestamp: new Date()
      }
    ]);

    // Auto-scroll after login
    setTimeout(() => {
      if (terminalRef.current) {
        const scrollElement = terminalRef.current.querySelector('.terminal-content');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
  };

  const cancelInput = () => {
    setCurrentInput("");
    setIsTyping(false);
    setHistoryIndex(-1);
    setCommandHistory(prev => {
      const newHistory = [...prev, {
        command: "^C",
        output: [],
        timestamp: new Date()
      }];
      // Auto-scroll after cancel
      setTimeout(() => {
        if (terminalRef.current) {
          const scrollElement = terminalRef.current.querySelector('.terminal-content');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 50);
      return newHistory;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      cancelInput();
      return;
    }

    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    } else {
      setIsTyping(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-black text-primary font-mono flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-2xl w-full flex flex-col justify-center items-center">
          <div className="mb-6 text-center">
            <pre className={`text-primary text-[6px] sm:text-[8px] md:text-xs leading-tight mb-6 overflow-hidden ${showAnimation ? 'animate-pulse' : ''}`}>
{`
 ███▄ ▄███▓ ▒█████   ▒█████   ███▄    █   ██████  ██░ ██  ▄▄▄      ▓█████▄  ▒█████   █     █░
▓██▒▀█▀ ██▒▒██▒  ██▒▒██▒  ██▒ ██ ▀█   █ ▒██    ▒ ▓██░ ██▒▒████▄    ▒██▀ ██▌▒██▒  ██▒▓█░ █ ░█░
▓██    ▓██░▒██░  ██▒▒██░  ██▒▓██  ▀█ ██▒░ ▓██▄   ▒██▀▀██░▒██  ▀█▄  ░██   █▌▒██░  ██▒▒█░ █ ░█ 
▒██    ▒██ ▒██   ██░▒██   ██░▓██▒  ▐▌██▒  ▒   ██▒░▓█ ░██ ░██▄▄▄▄██ ░▓█▄   ▌▒██   ██░░█░ █ ░█ 
▒██▒   ░██▒░ ████▓▒░░ ████▓▒░▒██░   ▓██░▒██████▒▒░▓█▒░██▓ ▓█   ▓██▒░▒████▓ ░ ████▓▒░░░██▒██▓ 
░ ▒░   ░  ░░ ▒░▒░▒░ ░ ▒░▒░▒░ ░ ▒░   ▒ ▒ ▒ ▒▓▒ ▒ ░ ▒ ░░▒░▒ ▒▒   ▓▒█░ ▒▒▓  ▒ ░ ▒░▒░▒░ ░ ▓░▒ ▒  
░  ░      ░  ░ ▒ ▒░   ░ ▒ ▒░ ░ ░░   ░ ▒░░ ░▒  ░ ░ ▒ ░▒░ ░  ▒   ▒▒ ░ ░ ▒  ▒   ░ ▒ ▒░   ▒ ░ ░  
░      ░   ░ ░ ░ ▒  ░ ░ ░ ▒     ░   ░ ░ ░  ░  ░   ░  ░░ ░  ░   ▒    ░ ░  ░ ░ ░ ░ ▒    ░   ░  
       ░       ░ ░      ░ ░           ░       ░   ░  ░  ░      ░  ░   ░        ░ ░      ░    
                                                                     ░                         
`}
            </pre>
            <div className={`mb-4 ${showAnimation ? 'animate-bounce' : ''}`}>
              <div className="text-accent text-sm md:text-lg mb-2">MoonShadow Terminal Interface</div>
              <div className="text-muted-foreground text-xs md:text-sm">Interactive Portfolio System v2.0</div>
            </div>
          </div>

          <div className="bg-card/20 border border-primary/30 rounded p-4 md:p-6 shadow-terminal w-full max-w-md">
            <div className="mb-4">
              <div className="text-primary mb-2 text-sm md:text-base">moonShadow-terminal login:</div>
              <div className="text-muted-foreground text-xs md:text-sm mb-4">
                Click the button below to access the interactive terminal
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded hover:bg-primary/90 transition-colors font-mono w-full text-sm md:text-base"
            >
              {'>>'} LOGIN
            </button>

            <div className="mt-4 text-xs text-muted-foreground">
              <div>System: ArchLinux MoonShadow-Edition</div>
              <div>Kernel: 6.1.0-enhanced-security</div>
              <div>Access Level: Guest → Full (after login)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-primary font-mono p-1 md:p-4 overflow-hidden flex flex-col">
      <div className="max-w-full md:max-w-6xl mx-auto flex-1 flex flex-col min-h-0">
        <div
          ref={terminalRef}
          className="bg-black border border-primary/30 rounded-lg shadow-terminal flex-1 flex flex-col min-h-0"
        >
          {/* Terminal Header */}
          <div className="bg-card/20 border-b border-primary/30 px-2 md:px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
            <span className="text-primary text-xs md:text-sm">moonShadow@terminal: ~</span>
            <div className="w-8 md:w-16"></div>
          </div>

           {/* Terminal Content */}
           <div className="terminal-content p-3 md:p-6 flex-1 overflow-y-auto min-h-0 scroll-smooth">
             {/* Command History */}
             <div className="space-y-3 md:space-y-5 mb-6">
               {commandHistory.map((entry, index) => (
                 <div key={index} className="mb-4">
                   <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-2">
                     <span className="text-accent text-xs md:text-base font-bold">moonShadow@terminal:~$</span>
                     <span className="text-primary text-xs md:text-base font-medium">{entry.command}</span>
                   </div>
                   <div className="ml-3 md:ml-6 mt-2">
                     {entry.output.map((line, lineIndex) => (
                       <div key={lineIndex} className="text-foreground leading-relaxed text-[11px] md:text-sm break-words py-0.5">
                         {parseAnsiColors(line)}
                       </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

             {/* Current Input */}
             <div className="flex items-center gap-2 md:gap-3 flex-wrap mt-4">
               <span className="text-accent text-xs md:text-base font-bold">moonShadow@terminal:~$</span>
               <input
                 ref={inputRef}
                 type="text"
                 value={currentInput}
                 onChange={(e) => setCurrentInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 className="bg-transparent border-none outline-none text-primary flex-1 font-mono text-xs md:text-base min-w-0 py-1"
                 placeholder=""
                 autoComplete="off"
                 spellCheck={false}
               />
               <span className="text-primary animate-pulse text-sm md:text-base">█</span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-[10px] md:text-xs text-muted-foreground text-center px-2 flex-shrink-0">
          <div className="mb-1">Use ↑/↓ arrow keys for command history | Type 'help' for available commands</div>
          <div>Ctrl+C to cancel input</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTerminal;