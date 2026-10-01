# Palette System

This is a work-in-progress version of the Palette system for foundry VTT.

# Usage
**Color rolls** are done with the `/rc` command. The basic usage is `/rc <number>`, where `<number>` is the number of dice to roll; e.g., `/rc 3`.
- `/rc` with no arguments **Rolls for Success**. If you have a token selected, it will pull the linked actor's Palette and compare against that for successes.  
- `/rc` with the `c` argument (ex: `/rc 3c` ) will **Roll for Color**.
- `/rc` with the `h` argument (ex: `/rc 3h` ) will **Roll for Hand**. The results include a "Add to Hand" button that, when clicked, will add the results to the selected token's Hand.