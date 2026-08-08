// Khymera Gripper - Live Telemetry & Jevil Stress Test
// Simulates a servo-actuated 4-bar linkage with real-time sensor jitter.

(function () {
    const W = 640;
    const H = 420;
  
    let sketch = function (p) {
      let time = 0;
      let packets = 0;
      let temperature = 32.0;
      
      // Modes: 0 = Nominal (Smooth), 1 = Jevil (Malicious Jitter/Stress)
      let isJevilMode = false;
  
      // Trail for the end-effector
      const trail = [];
      const MAX_TRAIL = 60;
  
      // Kinematic anchor points
      const originX = W / 2;
      const originY = H - 50;
      const armLength1 = 120;
      const armLength2 = 90;
  
      function resetTelemetry() {
        time = 0;
        packets = 0;
        temperature = 32.0;
        trail.length = 0;
        isJevilMode = false;
        updateStats();
      }
  
      function updateStats() {
        const pktEl = document.getElementById("khymera-packets");
        const tempEl = document.getElementById("khymera-temp");
        const modeBtn = document.getElementById("khymera-mode-btn");
  
        if (pktEl) pktEl.textContent = packets.toLocaleString();
        if (tempEl) tempEl.textContent = temperature.toFixed(1) + " °C";
        
        if (modeBtn) {
          if (isJevilMode) {
            modeBtn.textContent = "MODE: JEVIL (STRESS)";
            modeBtn.style.color = "#ff3366";
            modeBtn.style.borderColor = "#ff3366";
          } else {
            modeBtn.textContent = "MODE: NOMINAL";
            modeBtn.style.color = "var(--text-primary)";
            modeBtn.style.borderColor = "var(--border)";
          }
        }
      }
  
      function isLight() {
        return document.documentElement.getAttribute("data-theme") === "light";
      }
  
      p.setup = function () {
        const holder = document.getElementById("khymera-canvas-wrap");
        if (!holder) return; // Fallback if canvas wrap doesn't exist
        
        const canvas = p.createCanvas(W, H);
        canvas.parent(holder);
        p.pixelDensity(1);
        
        const modeBtn = document.getElementById("khymera-mode-btn");
        if (modeBtn) {
          modeBtn.addEventListener("click", () => {
            isJevilMode = !isJevilMode;
            updateStats();
          });
        }
        
        resetTelemetry();
      };
  
      p.draw = function () {
        const light = isLight();
        if (light) p.background(250, 250, 250);
        else p.background(10, 10, 10);
  
        // Grid background for that "engineering software" vibe
        p.stroke(light ? 220 : 30);
        p.strokeWeight(1);
        for (let i = 0; i < W; i += 40) p.line(i, 0, i, H);
        for (let j = 0; j < H; j += 40) p.line(0, j, W, j);
  
        // System Logic
        packets += Math.floor(p.random(1, 4));
        time += isJevilMode ? 0.08 : 0.02;
        
        if (isJevilMode) {
          temperature = p.min(temperature + 0.1, 85.5); // Heats up!
        } else {
          temperature = p.max(temperature - 0.05, 32.0); // Cools down
        }
        
        if (p.frameCount % 10 === 0) updateStats();
  
        // Inverse Kinematics / Procedural Animation
        // Base rotation
        let angle1 = p.map(p.noise(time), 0, 1, p.PI, p.PI * 2);
        // Joint rotation (adds malicious jitter if Jevil mode is on)
        let jitter = isJevilMode ? p.random(-0.5, 0.5) : 0;
        let angle2 = p.map(p.noise(time + 100), 0, 1, -p.PI/2, p.PI/2) + jitter;
  
        // Calculate joint positions
        let jointX = originX + p.cos(angle1) * armLength1;
        let jointY = originY + p.sin(angle1) * armLength1;
        
        let endX = jointX + p.cos(angle1 + angle2) * armLength2;
        let endY = jointY + p.sin(angle1 + angle2) * armLength2;
  
        trail.push({ x: endX, y: endY });
        if (trail.length > MAX_TRAIL) trail.shift();
  
        // Draw Trail
        p.noFill();
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1];
          const b = trail[i];
          const alpha = (i / trail.length) * 200;
          
          if (isJevilMode) p.stroke(255, 51, 102, alpha); // Red trail for stress
          else if (light) p.stroke(13, 148, 136, alpha);  // Teal trail for light mode
          else p.stroke(0, 255, 204, alpha);              // Cyan trail for dark mode
          
          p.strokeWeight(3);
          p.line(a.x, a.y, b.x, b.y);
        }
  
        // Draw Mechanical Arm
        p.stroke(light ? 100 : 200);
        p.strokeWeight(8);
        p.line(originX, originY, jointX, jointY); // Link 1
        p.line(jointX, jointY, endX, endY);       // Link 2
  
        // Draw Joints (Servos)
        p.noStroke();
        p.fill(light ? 50 : 255);
        p.circle(originX, originY, 24);
        p.circle(jointX, jointY, 18);
        
        // End Effector (Gripper Base)
        p.fill(isJevilMode ? "#ff3366" : (light ? "#0d9488" : "#00ffcc"));
        p.rectMode(p.CENTER);
        p.push();
        p.translate(endX, endY);
        p.rotate(angle1 + angle2);
        p.rect(0, 0, 20, 30, 4);
        p.pop();
      };
    };
  
    new p5(sketch);
  })();