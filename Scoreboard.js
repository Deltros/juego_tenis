const tennisScore = ["0", "15", "30", "40"]; 

class Scoreboard {
  constructor(scene, w, h) {
    this.scene = scene;
    this.scores = [0, 0];
    this.text = scene.add
      .text(w / 2, h * 0.52, "", { fontSize: "32px", fill: "#fff" })
      .setOrigin(0.5);
    this.update();
  }

  pointFor(winnerIndex) {
    this.scores[winnerIndex]++;
    if (this.scores[winnerIndex] > 3) {
      this.scores = [0, 0];
      alert(
        "¡Punto para " +
          (winnerIndex === 0 ? "Jugador 1!" : "el Bot!") +
          "\nPresiona espacio para continuar"
      );
    }
    this.update();
  }

  update() {
    const text = `Jugador 1: ${tennisScore[this.scores[0] || 0]}   |   Bot: ${tennisScore[this.scores[1] || 0]}`;
    this.text.setText(text);
  }
}
