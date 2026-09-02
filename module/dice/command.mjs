import { ColorRoll } from "./roll.mjs";



export async function handleColorCommand(command, match, chatData, createOptions) {
  const count = match[1] ? parseInt(match[1], 10) : 1;
  let hues = [];
  const actor = ChatMessage.getSpeakerActor(chatData.speaker) ?? game.user.character;
  if (!actor) {
    console.log("No character selected for color roll")
  } else { //if character is selected, grab hues
    hues = actor.items.filter((i) => i.type === "hue").map((i) => i.system.color);
  }

  try {
    //roll color dice
    const roll = new ColorRoll(`${count}dc6`, {}, { successColors: hues });
    await roll.evaluate();
    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
    });

  } catch (err) {
    console.error("Color Dice roll failed:", err);
    ui.notifications.error(err.message);
  }

  return false; 
}
