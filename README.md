# Onionhoney's Roux Trainers
- A trainer collection that caters to all your Roux training needs  ❤️
- Inspired by http://cubegrass.appspot.com/, but with everything that it is missing.


## Modes supported
- FB analyzer
    - Solves for all x2y FBs, and suggests the best FB to start with!
    - Other orientations supported too (CN, b/g x2y, etc.)
- FB last slot (+ DR) trainer
    - `HIGHLY USEFUL` if you're learning FB or FB + DR. Get a random scramble, think on your own, and check with our solutions!
    - **Note**: while I try my best, the solver can still miss out on the best overall solution. So please, consult your human fellows when you're unsure, and always be careful with what you choose to learn.
- FS/FB/SS trainer
    - You can specify by piece positions. It seems these modes are pretty useful in providing new insights into blockbuilding  (for us dumb humans).
- CMLL trainer
    - Truly random scrambles so you can't tell the cases. You can specify different OCLLs. You can even start with a random SB last pair (to simulate how real recognition works)
- LSE trainers (EOLR, 4c)
    - Good for reviewing EOLR and practicing your 4c recognition method. You can filter by MC/Non-MC cases too.


## Functionalities
- Scrambles are all random state. Solver is Roux-optimized with M and r moves as first-class citizens, with up to 25 different solutions provided.

- You can control the virtual cube with keyboard (CStimer mapping). You can also drag on the cube to change its perspective.

- You can bookmark your favorite cases and these will be saved in your browser.

- You can input your own scrambles as a list and our trainer will drain them one by one!

- Appearance: dark mode enabled.

---

## Version Log
- (v1.0.0) All work prior to 12/02/2020, which I forgot to version log for.
- (v1.0.1) 12/02/2020: Add edge position control for FB Last Pair trainer.
- (v1.1) 12/15/2020: Reworked UI. App bar now features a dropdown menu for selecting the mode. Scramble occupies its own row. Solutions are shown side by side with the sim cube in large screen.
- (v1.2) 12/17/2020: Add support for scramble input for all modes. Now you can paste in a list of scrambles, and the trainer will consume them one by one in order.
- (v1.3) 12/20/2020: Solve Analysis Beta is online! It can do the following:
    - For any random scramble, it'll recommend the best FB solutions over all orientations (e.g. x2y yellow/white).
    - Given a solve reconstruction, it'll analyze each stage, and compare your solution there with the solver-suggested solutions.
- (v1.4) 12/23/2020: Refine the appearance of the virtual cube and enable camera control with mouse dragging.
- (v1.5) 2/18/2021: Introduced Tracking Trainer Beta.
- (v1.6) 7/11/2021: You can train CMLL by case now. And by NMCLL case too if you want.
    - We added a case selection menu to help you pick cases conveniently.
    - We also let you select cases based on the L/R face shape, to assist users of NMCLL-based recognition methods. As usual, we're the first ever trainer to do so.

- (v1.7) 10/3/2021:
    - Add level selection on most modes. i.e. you can filter case by solution movecount now.
    - Add FBLP + SS Trainer mode. I don't know, this might help solves of the future.
    - Solver performance enhancements.
    - Clarify wording for config options.

- (v1.8) 09/01/2022: Minor fixes and functionality enhancements! (i'm back)
    - Add a button so you can conveniently enter your solution as scramble input.
    - Fixed up NMCMLL case alignment so the selected hyperorientation pattern will always show up in your chosen color.
    - FB+DR trainer's solved pair mode now supports pairs at the back too.
    - Added some experimental alg evaluators: a dynamic programming algorithm on grip position, and a piece movement counter. Won't be used in production yet.

- (v2.0) 08/19/2023:
    - Version 2 because I said so!
        - Seriously though, V2 (hopefully) marks the beginning of a paradigm shift: let's move to a community-based contribution pattern so that changes are no longer solely driven by my personal motivations.
    - Enter the FS+DR mode! Gives you a new way to look at block-building starts.
    - In EOLR(b) mode, you can now train for EOdM if you'd like.
    - Enhancement to mobile UI experience. (still ongoing)
    - Tweaks to user settings (you can now toggle movecount hint, and generate up to 100 solutions)
    - Enhancement to visual cube. (Press down keys {1,2,3,9,0} to peek at other faces without rotating)

- (v2.1) 06/09/2025:
    - It's been a while! Brought to you by yours truly:
    - x2y FB Analyzer just got better with a FS/Pseudo FS/Line analyzer!
        - So you can train yourself to spot all the 'easy opening' patterns
        - Also, I added a hint mode, where the solutions are presented as quizzes. Go quiz your friends!
    - Revamped CMLL trainer
        - Added 2D case visualizer
        - **IMPORTANT**: you can now display only the stickers necessary for recognition! James Macdiarmid style is supported for now.

=======

If you have ideas on how to improve the app just shoot a message and let me know. <3
