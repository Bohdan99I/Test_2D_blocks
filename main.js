function createBlock(blockWidth, blockHeight) {
  return {
    width: blockWidth,
    height: blockHeight,
    isPlaced: false,
    coordinates: { top: null, left: null, right: null, bottom: null },
    color: null,
  };
}

function createContainer(containerWidth, containerHeight) {
  return {
    width: containerWidth,
    height: containerHeight,
    internalCavities: [
      { top: 0, left: 0, right: containerWidth, bottom: containerHeight },
    ],
  };
}

function calcMetrics(blocks, container) {
  const totalBlockArea = blocks.reduce(
    (total, block) => total + block.width * block.height,
    0
  );

  const freeSpacesArea = container.internalCavities.reduce(
    (total, space) =>
      total + (space.right - space.left) * (space.bottom - space.top),
    0
  );

  const fullness = 1 - freeSpacesArea / (freeSpacesArea + totalBlockArea);

  const blockCoordinates = blocks
    .filter((block) => block.isPlaced)
    .map((block, index) => ({
      top: block.coordinates.top,
      left: block.coordinates.left,
      right: block.coordinates.right,
      bottom: block.coordinates.bottom,
      initialOrder: index,
      color: block.color,
    }));

  return { fullness, blockCoordinates };
}

function stackBlocks(blocks, container) {
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  for (const block of blocks) {
    const spaceIndex = container.internalCavities.findIndex(
      (space) =>
        block.width <= space.right - space.left &&
        block.height <= space.bottom - space.top
    );

    if (spaceIndex !== -1) {
      const space = container.internalCavities[spaceIndex];

      block.coordinates = {
        top: space.top,
        left: space.left,
        right: Math.min(space.left + block.width, space.right),
        bottom: Math.min(space.top + block.height, space.bottom),
      };

      block.isPlaced = true;

      const newFreeSpaces = [
        {
          top: space.top,
          left: space.left,
          right: space.right,
          bottom: block.coordinates.top,
        },
        {
          top: block.coordinates.bottom,
          left: space.left,
          right: space.right,
          bottom: space.bottom,
        },
        {
          top: space.top,
          left: space.left,
          right: block.coordinates.left,
          bottom: block.coordinates.bottom,
        },
        {
          top: space.top,
          left: block.coordinates.right,
          right: space.right,
          bottom: block.coordinates.bottom,
        },
      ];

      container.internalCavities.splice(spaceIndex, 1, ...newFreeSpaces);
    }
  }

  addColor(blocks);

  return calcMetrics(blocks, container);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function addColor(blocks) {
  const uniqueBlockSizes = new Map();

  for (const block of blocks) {
    const { width, height } = block;

    if (block.color === null) {
      block.color = uniqueBlockSizes.has(`${width}-${height}`)
        ? uniqueBlockSizes.get(`${width}-${height}`)
        : getRandomColor();

      uniqueBlockSizes.set(`${width}-${height}`, block.color);
    }
  }
}

async function loadBlocksData() {
  const response = await fetch("blocks.json");
  const blocksInfo = await response.json();
  return blocksInfo;
}

function updateUI(result, containerInfo) {
  const containerDiv = document.getElementById("container");
  containerDiv.style.width = containerInfo.width + "px";
  containerDiv.style.height = containerInfo.height + "px";

  const fullness = document.getElementById("fullness-value");
  fullness.textContent = result.fullness.toFixed(2);

  containerDiv.innerHTML = "";

  result.blockCoordinates.forEach((coords) => {
    const block = document.createElement("div");
    block.className = "block";
    block.textContent = `${coords.initialOrder}`;
    block.style.width = `${coords.right - coords.left}px`;
    block.style.height = `${coords.bottom - coords.top}px`;
    block.style.top = `${coords.top}px`;
    block.style.left = `${coords.left}px`;
    block.style.right = `${coords.right}px`;
    block.style.bottom = `${coords.bottom}px`;
    block.style.backgroundColor = `${coords.color}`;
    containerDiv.appendChild(block);
  });
}

async function initialize() {
  const blocksInfo = await loadBlocksData();
  const blocks = blocksInfo.map((info) => createBlock(info.width, info.height));

  const containerInfo = {
    width: 350,
    height: 300,
  };
  const container = createContainer(containerInfo.width, containerInfo.height);
  const result = stackBlocks(blocks, container);
  updateUI(result, containerInfo);

  window.addEventListener("resize", () => {
    containerInfo.width = window.innerWidth;
    containerInfo.height = window.innerHeight;
    const result = stackBlocks(blocks, container);
    updateUI(result, containerInfo);
  });
}

window.onload = initialize;
