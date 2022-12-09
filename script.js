/**
 * Author: Muhammad Zaryaab Shahbaz
 * Email: zariab64@gmail.com
 * Date: 11/22/22
 */
const yeti = document.getElementById("yeti");
const arrow = document.getElementById("arrow");
const mcskidy = document.getElementById("mcskidy");
const shieldContainer = document.getElementById("shields");
let selectedElement;

const shield = '<img class="shield" src="images/shield.png"/>';
// paths
const yetiDownSrc = "images/Yeti with bow and arrow down.png";
const yetiUpSrc = "images/Yeti with bow and arrow up.png";
const yetiReleaseSrc = "images/Yeti releasing bow and arrow.png";
const mcskidySrc = "images/McSkidy calm.png";
const mcskidyHitSrc = "images/McSkidy been shot.png";

const attacks = [
  "Bandit Yeti has identified an open SSH port on Santa’s webserver.",
  "A document file with malicious macros is opened by a user.",
  "Some sensitive data related to Santa’s server is found on a filesharing website.",
  "Spoofed phishing emails are sent to Santa's employees.",
  "Password brute-forcing attack is attempted on Santa's account.",
  "Santa’s employee finds a USB flash drive in the parking lot; after he plugs it into his computer, malware installs on the machine.",
];
const asr = [
  {
    id: 2,
    value:
      "Sensitive data from the file-sharing site is removed to avoid Bandit Yeti taking advantage of that data.",
  },
  { id: 0, value: "Unnecessary ports are closed to avoid attack attempts." },
  {
    id: 4,
    value: "Strong password policy is enabled to thwart brute force attacks.",
  },
  {
    id: 1,
    value:
      "Security policies are implemented to block macros on Santa's network.",
  },
  {
    id: 5,
    value:
      "Applocker is deployed network-wide to block execution of unknown/non-whitelisted applications.",
  },
  { id: 3, value: "Phishing protection is enabled on Santa’s email server." },
];

const template = num => {
  return `<div class="section d-flex align-items-center text-center py-2">
    <p class="static w-50 my-1 pe-2">${attacks[num]}</p>
    <div id="free_${num}" class="free w-50 my-1" data-position=${num}> 
      
    </div>
  </div>`;
};

const asrTemplate = num => {
  return `<div class="col-md-4 py-2">
    <p id="asr_${asr[num].id}" class="free-child mb-0 px-2 py-1 rounded h-100" draggable=true data-position=${asr[num].id}>${asr[num].value}</p>
  </div>`;
};

const addShield = () => {
  $(shieldContainer).append(shield);
};

// check if piece is in correct position
const checkPiece = (piece, parent) => {
  const piecePosition = $(piece).data("position");
  const parentPostion = $(parent).data("position");
  if (
    piecePosition === parentPostion &&
    !$(parent)
      .parent()
      .hasClass("asrs")
  ) {
    $(parent)
      .parent()
      .addClass("correct");
    return true;
  }

  return false;
};

// check if all pieces are in correct place
const checkWin = () => {
  const correct = $(".correct").length;
  const total = $(".free-child").length;

  const percent =
    Math.round(((correct / total) * 100 + Number.EPSILON) * 100) / 100;
  const progress = document.getElementById("puzzle-progress");
  const color = percent >= 50 ? "#A3EA2A" : "#ECBB0A";
  progress.setAttribute("style", `color: ${color}`);
  $(progress).html(`${percent}%`);

  $("#question-number").html(correct);

  if (correct !== total) return;

  const flag = document.getElementById("flag");
  flag.innerText = atob(flag.innerText);

  $("#next-btn").removeClass("d-none");
};

const nextBtnClick = () => {
  $("#content").addClass("d-none");
  $("#reward").removeClass("d-none");
};

const addShields = (count = 1) => {
  for (let i = 0; i < count; i++) {
    addShield();
  }
};

const queue = (fn, ms = 500) => {
  return new Promise(resolve => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};

const yetiUp = () => {
  yeti.src = yetiUpSrc;
  yeti.classList.remove("down");
};

const yetiRelease = () => {
  yeti.src = yetiReleaseSrc;
  yeti.classList.add("release");
};

const yetiDown = () => {
  yeti.classList.add("down");
  yeti.classList.remove("release");
  yeti.src = yetiDownSrc;
};

const attack = async () => {
  const shields = shieldContainer.children.length;
  await queue(() => yetiUp());
  await queue(() => yetiRelease());
  await queue(() => {
    let left = mcskidy.parentElement.offsetLeft - mcskidy.clientWidth;
    if (shields !== 6) {
      // pick mcskidy as reference for arrow hit
      left += 30;
    }

    yetiDown();
    arrow.classList.remove("d-none");
    setTimeout(() => (arrow.style.left = `${left}px`), 0);
  });
  await queue(() => {
    arrow.classList.add("d-none");
    arrow.style.left = `116px`;
    if (shields !== 6) {
      // hit mcskidy
      mcskidy.src = mcskidyHitSrc;
    }
  }, 1000);
  await queue(() => (mcskidy.src = mcskidySrc));
};

const updateHeights = () => {
  const free = $(".free");
  free.each(i => {
    const sibling = $(free[i]).prev(".static");
    free[i].setAttribute("style", `min-height: ${sibling.height()}px`);
  });
};

// create matching column
const init = () => {
  const pieces = attacks.length;

  const wrapper = document.getElementById("wrapper");
  const asrWrapper = document.getElementById("asrs");

  // create empty game variable
  let content = "";
  let asrs = "";

  // create each piece as an element
  for (let i = 0; i < pieces; i++) {
    content += template(i);
    asrs += asrTemplate(i);
  }

  // insert templates into DOM
  $(wrapper).append(content);
  $(asrWrapper).append(asrs);
  updateHeights();

  const gridTiles = $(".free");
  const allPieces = $(".free-child");

  allPieces.each(i => {
    // user starts dragging event
    allPieces[i].addEventListener("dragstart", event => {
      selectedElement = event.target.id;
    });
  });

  gridTiles.each(i => {
    // enable dropping
    gridTiles[i].addEventListener("dragover", event => {
      event.preventDefault();
    });

    // user starts drop event
    gridTiles[i].addEventListener("drop", event => {
      const selected = $("#" + selectedElement);
      const target = $(event.target).hasClass("free-child")
        ? $(event.target).closest(".free")
        : "#" + event.target.id;

      // add piece to grid tile if tile empty or swap
      let count = 0;
      if ($(target).html().length) {
        const pieceToSwap = $(target).find(".free-child");
        const selectedParent = selected.parent();

        if (checkPiece(pieceToSwap, selectedParent)) {
          pieceToSwap.appendTo(selectedParent);
        }
        if (checkPiece(selected, $(target))) {
          selected.appendTo(target);
        }

        count += checkPiece(pieceToSwap, selectedParent);
        count += checkPiece(selected, $(target));
      } else {
        selected.appendTo(target);
        count += checkPiece(selected, $(target));
      }

      setTimeout(() => checkWin(), 100);
      if (count) {
        // add shield
        addShield();
      }
    });
  });
};

$(
  (async function() {
    // init the match the column
    init();
    // init shields
    // addShields(6);
    // init first attack
    await attack();
    const intervalId = setInterval(async () => {
      await attack();
    }, 2000);
    $(window).resize(updateHeights);
  })()
);
