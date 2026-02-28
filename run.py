import subprocess
import os
import sys
import threading
import time

def run_command(command, cwd, name):
    """Starts a subprocess and returns the process object."""
    print(f"[{name}] Starting command: {command}")
    try:
        # Use shell=True for Windows to handle batch files and npm commands correctly
        process = subprocess.Popen(
            command,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        return process
    except Exception as e:
        print(f"[{name}] Error starting process: {e}")
        return None

def monitor_output(process, name):
    """Reads and prints output from a process."""
    if not process or not process.stdout:
        return
    try:
        for line in iter(process.stdout.readline, ""):
            if line:
                print(f"[{name}] {line.strip()}")
    except Exception as e:
        print(f"[{name}] Error reading output: {e}")
    finally:
        if process.stdout:
            process.stdout.close()

def main():
    # Detect directories relative to this script
    root_dir = os.path.dirname(os.path.abspath(__file__))
    be_dir = os.path.join(root_dir, "be")
    fe_dir = os.path.join(root_dir, "fe")

    # Commands for Windows
    # Backend: Gradle wrapper should be used
    be_cmd = "gradlew.bat bootRun"
    # Frontend: npm dev script (usually vite)
    fe_cmd = "npm run dev"

    print("=" * 50)
    print("Unified Runner: React + Spring Boot")
    print("=" * 50)

    processes = []
    threads = []

    # Start Backend
    be_process = run_command(be_cmd, be_dir, "Backend")
    if be_process:
        processes.append(be_process)
        t = threading.Thread(target=monitor_output, args=(be_process, "Backend"), daemon=True)
        t.start()
        threads.append(t)

    # Start Frontend
    fe_process = run_command(fe_cmd, fe_dir, "Frontend")
    if fe_process:
        processes.append(fe_process)
        t = threading.Thread(target=monitor_output, args=(fe_process, "Frontend"), daemon=True)
        t.start()
        threads.append(t)

    if not processes:
        print("Failed to start processes. Exiting.")
        return

    print("\nBoth processes are starting. Press Ctrl+C to stop both.\n")

    try:
        while True:
            # Check if any process has exited
            for p in processes:
                poll = p.poll()
                if poll is not None:
                    name = "Backend" if p == be_process else "Frontend"
                    print(f"\n[{name}] Process exited with code {poll}")
                    raise KeyboardInterrupt
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping processes gracefully...")
    finally:
        for p in processes:
            if p.poll() is None:
                # Force kill process tree on Windows to ensure child processes (like java or node) are stopped
                try:
                    subprocess.run(f"taskkill /F /T /PID {p.pid}", shell=True, capture_output=True)
                except:
                    p.terminate()
        print("All processes stopped. Hardware resources released.")

if __name__ == "__main__":
    main()
