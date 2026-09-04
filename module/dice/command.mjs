import { ColorRoll } from "./roll.mjs";



export async function handleColorCommand(command, match, chatData, createOptions) {
  const count = match[1] ? parseInt(match[1], 10) : 1;
  /**
   * No option: Roll for Success
   * Option "h": Roll for Color w/ Hand
   * Option "c": Non-hand Roll for Color
   */
  const hand = match[2] == "h";
  let success = match[2] == "";
  let hues = [];
  const actor = ChatMessage.getSpeakerActor(chatData.speaker) ?? game.user.character;
  if (!actor) {
    console.log("No character selected for color roll")
  } else { //if character is selected, grab hues
    hues = actor.items.filter((i) => i.type === "hue").map((i) => i.system.color);
  }

  try {
    console.log(success)
    //roll color dice
    const roll = new ColorRoll(`${count}dc6`, {}, { 
        successColors: hues, 
        hand: hand,
        success: success,
    });
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

export async function addToHand(message){
  let actor;
  /** Priority order:
   * 1. Currently selected token
   * 2. Chat message actor
   * 3. Game actor
   */
  if (canvas.tokens.controlled[0]){
    actor = canvas.tokens.controlled[0].actor;
  } else {
    ChatMessage.getSpeakerActor(message.speaker) || game.user.character;
  }
  
  if (!actor){ //all checks failed
    ui.notifications.error("No valid target found!")
  } else {
    //console.log(actor)
    //console.log(message.rolls[0].faceResults)
    let rolls = message.rolls[0].faceResults;
    if (!actor.system.hand.locked){ //check if character has access to hand
      let curr = actor.system.hand.value;
      let data = rolls.map((i) => i.color);
      await actor.update({"system.hand.value": curr.concat(data)}); //add to current
      console.log(actor)
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `Added hand to ${actor.name}!`
      })
    } else {
      ui.notifications.error("Target does not have access to Hand.")
    }
    
  }
}