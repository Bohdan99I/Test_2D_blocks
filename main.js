window.onload = function () {
  const containerElement = document.getElementById("container");
  const fullnessHeading = document.getElementById("fullness-heading");

  const container = { width: 500, height: 500 };

  fetch("blocks.json")
    .then((response) => response.json())
    .then((blocks) => {
      const result = packBlocks(container, blocks);
      containerElement.style.width = container.width + "px";
      containerElement.style.height = container.height + "px";

      result.blockCoordinates.forEach((block, index) => {
        const blockElement = document.createElement("div");
        blockElement.className = "block";
        blockElement.style.width = block.right - block.left + "px";
        blockElement.style.height = block.bottom - block.top + "px";
        blockElement.style.backgroundColor = getRandomColor();
        blockElement.innerHTML = index;
        blockElement.style.position = "absolute";
        blockElement.style.left = block.left + "px";
        blockElement.style.top = block.top + "px";
        containerElement.appendChild(blockElement);
      });

      fullnessHeading.innerHTML =
        "Fullness: <span id='fullness-value'>" +
        result.fullness.toFixed(2) +
        "</span>";
    });

  function packBlocks(container, blocks) {
    const blockCoordinates = [];
    let currentX = 0;
    let currentY = 0;

    blocks.forEach((block, index) => {
      const blockWidth = block.width;
      const blockHeight = block.height;

      let canPlace = true;

      for (const existingBlock of blockCoordinates) {
        if (
          currentX + blockWidth > container.width ||
          currentY + blockHeight > container.height ||
          (currentX + blockWidth > existingBlock.left &&
            currentX < existingBlock.right &&
            currentY + blockHeight > existingBlock.top &&
            currentY < existingBlock.bottom)
        ) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        blockCoordinates.push({
          top: currentY,
          left: currentX,
          right: currentX + blockWidth,
          bottom: currentY + blockHeight,
          initialOrder: index,
        });

        currentX += blockWidth;
      } else {
        // Move to the next row
        currentX = 0;
        currentY += blockHeight;

        blockCoordinates.push({
          top: currentY,
          left: currentX,
          right: currentX + blockWidth,
          bottom: currentY + blockHeight,
          initialOrder: index,
        });

        currentX += blockWidth;
      }
    });

    const totalArea = container.width * container.height;
    const occupiedArea = blockCoordinates.reduce((area, block) => {
      return area + (block.right - block.left) * (block.bottom - block.top);
    }, 0);

    const fullness = 1 - occupiedArea / totalArea;

    return { fullness, blockCoordinates };
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
};
