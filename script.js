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

const shield = '<img class="h-100" src="images/shield.png"/>';
// paths
const yetiDownSrc = "images/Yeti with bow and arrow down.png";
const yetiUpSrc = "images/Yeti with bow and arrow up.png";
const yetiReleaseSrc = "images/Yeti releasing bow and arrow.png";
const mcskidySrc = "images/McSkidy calm.png";
const mcskidyHitSrc = "images/McSkidy been shot.png";

const attacks = [
  "Bandit Yeti has identified an open SSH port on Santa’s webserver.",
  "A document file with malicious macros is opened by a user",
  "Some sensitive data related to Santa’s server is found on a filesharing website",
  "Spoofed phishing emails are sent to Santa’s employees",
  "Password brute forcing attack is attempted on Santa's",
  "Santa’s employee finds a USB in the parking lot that has malware and he plugs it in his system and gets compromised",
];
const asr = [
  {
    id: 2,
    value:
      "Sensitive data from the file-sharing site is removed to avoid Bandit Yeti taking advantage of that data",
  },
  { id: 0, value: "Unnecessary ports are closed to avoid attack attempts" },
  {
    id: 4,
    value: "Strong password policy is enabled to thwart brute force attacks",
  },
  { id: 1, value: "Macros are blocked on the Santa's network by policy" },
  {
    id: 5,
    value:
      "Applocker is deployed network-wide to block execution of unknown/non-whitelisted applications.",
  },
  { id: 3, value: "Phishing protection is enabled on Santa’s email server" },
];

const template = num => {
  return `<div class="section d-flex align-items-center text-center py-2" data-position=${num}>
  <p class="static w-50 my-1 pe-2">${attacks[num]}</p>
  <p id="asr_${asr[num].id}" class="free w-50 my-1 ms-2 px-2 rounded" draggable=true data-position=${asr[num].id}>${asr[num].value}</p>
</div>`;
};

const addShield = () => {
  $(shieldContainer).append(shield);
};

// check if piece is in correct position
const checkPiece = (piece, parent) => {
  if ($(piece).data("position") === $(parent).data("position")) {
    $(parent).addClass("correct");
    return true;
  } else if (parent.hasClass("correct")) {
    $(parent).removeClass("correct");
  }

  return false;
};

// check if all pieces are in correct place
const checkWin = () => {
  const correct = $(".correct").length;
  const total = $(".free").length;

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

const attack = async () => {
  await queue(() => (yeti.src = yetiUpSrc));
  await queue(() => (yeti.src = yetiReleaseSrc));
  await queue(() => {
    const shields = shieldContainer.children.length;
    let left = 0;
    if (shields) {
      // pick first shield as reference for arrow hit
      const firstShield = shieldContainer.children[0];
      left = shieldContainer.offsetLeft - firstShield.clientWidth;
    } else {
      // pick mcskidy as reference for arrow hit
      left = mcskidy.offsetLeft - mcskidy.clientWidth;
    }

    arrow.classList.remove("d-none");
    setTimeout(() => (arrow.style.left = `${left}px`), 0);
  });
  await queue(() => (yeti.src = yetiDownSrc));
  await queue(() => {
    arrow.classList.add("d-none");
    arrow.style.left = `60px`;
    if (shieldContainer.children.length) {
      // remove shield
      shieldContainer.removeChild(shieldContainer.children[0]);
    } else {
      // hit mcskidy
      mcskidy.src = mcskidyHitSrc;
    }
  }, 1000);
};

// create matching column
const init = () => {
  const pieces = attacks.length;

  const wrapper = document.getElementById("wrapper");

  // create empty game variable
  let content = "";

  // create each piece as an element
  for (let i = 0; i < pieces; i++) {
    content += template(i);
  }

  // insert templates into DOM
  $(wrapper).append(content);

  const gridTiles = $(".free");

  gridTiles.each(i => {
    // enable dropping
    gridTiles[i].addEventListener("dragover", event => {
      event.preventDefault();
    });

    // user starts dragging event
    gridTiles[i].addEventListener("dragstart", event => {
      selectedElement = event.target.id;
    });

    // user starts drop event
    gridTiles[i].addEventListener("drop", async event => {
      const selected = $("#" + selectedElement);
      const target = $(event.target).hasClass("free")
        ? $(event.target).closest(".section")
        : "#" + event.target.id;

      // add piece to grid tile if tile empty or swap
      if ($(target).html().length) {
        const pieceToSwap = $(target).find(".free");
        const selectedParent = selected.parent();

        pieceToSwap.appendTo(selectedParent);
        selected.appendTo(target);

        let count = 0;
        count += checkPiece(selected, target);
        count += checkPiece(pieceToSwap, selectedParent);

        if (count) {
          // add shield
          addShield();
          mcskidy.src = mcskidySrc;
        }
        await attack();
      }

      setTimeout(() => checkWin(), 100);
    });
  });
};

$(
  (async function() {
    // init the match the column
    init();
    // init shields
    addShields(4);
    // init first attack
    await attack();
  })()
);
