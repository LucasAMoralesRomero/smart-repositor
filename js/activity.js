document.getElementById("showProgress").addEventListener("click", function() {
  const progressList = document.getElementById("progressList");
  const tasks = [
    "27/12 - Se detecta falla en el sistema, se pone el mismo en modo mantenimiento 👷‍♂️",
    "28/12 - Comienza el trabajo en el  servidor (smart-repositor-server) 🛠️",
    "29/12 - Comienzan las pruebas del servidor en entornos controlados 🧪"];

  // Limpiar la lista si ya fue cargada
  progressList.innerHTML = "";

  // Simular tiempo real agregando cada tarea con un retraso
  tasks.forEach((task, index) => {
    setTimeout(() => {
      const listItem = document.createElement("li");
      listItem.textContent = task;
      progressList.appendChild(listItem);
    }, index * 2000); // Agregar tareas cada 2 segundos
  });
});