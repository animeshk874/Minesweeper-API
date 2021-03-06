"use strict";



function cacheResources(flag, mine){
    var imgElOne = document.createElement("img");
    imgElOne.src = flag;
    var imgElTwo = document.createElement("img");
    imgElTwo.src = mine;
}


//The function that will be called by the user
function Minesweeper(paramObj){
    var size = paramObj.size || 8; // 8 is the default size
    var minesCount = paramObj.minesCount || 10; // 10 is the default number of mines
    var elementId;
    var flagIcon = paramObj.flagIcon || "https://boring-minesweeper.surge.sh/Minesweeper/images/flag.png";
    var mineIcon = paramObj.mineIcon || "https://boring-minesweeper.surge.sh/Minesweeper/images/mine.png";
    cacheResources(flagIcon, mineIcon);
    if(!(paramObj.elementId)){
        console.error("Invalid DOM Element ID.");
        return;
    }
    else{
        elementId = paramObj.elementId;
    }

    var mineMatrixCreatorInstance = mineMatrixCreator(size, minesCount);
    var mineMatrix = mineMatrixCreatorInstance.buildMineMatrix();

    var UIInstance = UIRenderer(elementId, minesCount, mineMatrix, flagIcon, mineIcon);
    UIInstance.renderUI();

}

//This function creates the mine matrix
function mineMatrixCreator(size, minesCount){
    var publicAPI;

    function buildMineMatrix(){
        var mineMatrix = [], minesSet = 0, row, col;

        //Check if number of mines is less than "size" or not
        if(minesCount > size*size){
            alert("Number of mines is greater than the size.");
            return;
        }


        //Initialize the mineMatrix with all zeros
        initMineMatrix();
        //Set the mines
        setMines();
        //Set the values in each element
        setValuesInElements();



        /*-----------------Function declarations below-------------*/
        function initMineMatrix(){
            for(let i = 0; i < size; i++){
                let temp = [];
                for(let j = 0; j < size; j++){
                    temp.push(0);
                }
                mineMatrix.push(temp);
            }
        }

        function setMines(){
            for(let i = 0; i < minesCount;){
                row = Math.floor(Math.random()*(size));
                col = Math.floor(Math.random()*(size));
                if(mineMatrix[row][col] !== 'M'){
                    mineMatrix[row][col] = 'M';
                    i++;
                }
            }
        }

        function setValuesInElements(){
            for(let i = 0; i < size; i++){
                for(let j = 0; j < size; j++){
                    if(mineMatrix[i][j] !== 'M'){
                        mineMatrix[i][j] = getNeighboringMinesCount(i, j);
                    }
                }
            }

            //Nested because this function isn't needed anywhere else
            function getNeighboringMinesCount(row, col){
                var count = 0;
                for(let i = row - 1; i <= row + 1; i++){
                    if(i > -1 && i < size){
                        for(let j = col - 1; j <= col + 1; j++){
                            if((j > -1 && j < size) && mineMatrix[i][j] == 'M'){
                                count++;
                            }
                        }
                    }
                }
                return count;
            }
        }

        return mineMatrix;
    }
        
    publicAPI = {
        buildMineMatrix: buildMineMatrix
    }

    return publicAPI;
}



//-------------------------UI Renderer Below-----------------------------------
function UIRenderer(elementId, minesCount, mineMatrix, flagIcon, mineIcon){
    var publicAPI, mineClickTopic = elementId + "mineClicked";
    var size = mineMatrix.length;
    //mineClickTopic is the topic that will be published when a mine is clicked

    //countElementsLeft will be used later to check if the user has found all the mines
    var countElementsLeft;
    countElementsLeft = size*size - minesCount;

    function renderUI(){
        var parentSize = $( "#" + elementId).css("width"), el = document.getElementById(elementId), el1;
        parentSize = parseInt(parentSize);
        size = parseInt(size);
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.justifyContent = "space-around";
        el.style.height = parentSize + "px";
        
    
        // Margin and dimension calculations here
        var margin = 2, d = Math.floor((parentSize - (size+1) * margin) / size);
        for(let i = 0; i < size; i++){
            el1 = document.createElement("div");
            el1.className = "row";
            el1.setAttribute("data-row-id", i);
            setRowStyles(el1);
            renderChildElements(el1, i);
            el.appendChild(el1);
        }
    
        function setRowStyles(el){
            el.style.display = "flex";
            el.style.justifyContent = "space-between";
            el.style.width = "100%";
            el.style.height = d + "px";
        }
    
    
        function renderChildElements(el, i){
            var el2, textNode;
            for(let j = 0; j < size; j++){
                el2 = document.createElement("div");
                el2.setAttribute("id", "r" + i + "-" + "c" + j);
                el2.className = "element closed"; //"closed" is used to determine whether the lement is opened(clicked) or not
                el2.setAttribute("data-element-id", j);
                el2.setAttribute("data-row", i);
                el2.setAttribute("data-col", j);
                setElementStyles(el2);
                textNode = document.createTextNode(mineMatrix[i][j]);
                //el2.appendChild(textNode);
                el.appendChild(el2);
                el2.addEventListener("click", openElement);
    
                //on right-clicking the element
                el2.addEventListener("contextmenu", flagElement.bind(el2, i, j));
    
                if(mineMatrix[i][j] === 'M'){
                    let tempEl = el2;
                    $.subscribe(mineClickTopic, function(){
                        tempEl.style.background = "url(" + mineIcon + ") #ccc";
                        tempEl.style.backgroundSize = "contain";
                    });
                }
            }
    
            function setElementStyles(el){
                el.style.position = "relative";
                el.style.width = d + "px";
                el.style.height = d + "px";
                el.style.textAlign = "center";
                // el.style.boxSizing = "border-box";
                // el.style.border = "1px solid red";
                el.style.background = "#ccc";
                el.style.borderRadius = "2px";
    
                var el2 = document.createElement("div");
                styleTextNode(el2);
                el.appendChild(el2);
            }
    
            function styleTextNode(el2){
                el2.style.position = "absolute";
                el2.style.top = "50%";
                el2.style.left = "50%";
                el2.style.transform = "translate(-50%, -50%)";
                el2.style.fontSize = d/2 + "px";
                el2.style.fontFamily = "sans-serif";
                el2.style.color = "#555";
                el2.style.lineHeight = d/2 + "px";
            }
    
            function flagElement(i, j, ev){
                ev.preventDefault();
                if(this.className.indexOf("flagged") > -1){
                    this.style.background = "#ccc";
                    $(this).removeClass("flagged");
                }
                else if(mineMatrix[i][j] !== -1){ // check if the element is already opened
                    this.style.background = "url(" + flagIcon + ") #ccc";
                    this.style.backgroundSize = "contain";
                    $(this).addClass("flagged");
                }
            }
    
    
            // Remove "click" event listener when a mine is clicked
            $.subscribe(mineClickTopic, function(){
                var el = document.getElementsByClassName("closed");
                for(let i = 0; i < el.length; i++){
                    el[i].removeEventListener("click", openElement);
                }
                for(let i = 0; i < size; i++){
                    for(let j = 0; j < size; j++){
                        mineMatrix[i][j] = -1; 
                    }
                }
            });


            function openElement(){
                //Flagged elements cannot be opened by clicking on it(until it is flagged)
                if(this.className.indexOf("flagged") > -1){
                    return;
                }
                var row = parseInt(this.getAttribute("data-row"));
                var col = parseInt(this.getAttribute("data-col"));
    
                /*current element is not 0, not already opened(=-1), and not a mine(=M), i.e.,
                the current element is a NON-ZERO element that has not been opened yet. Also,
                it does not contain mine.
                */
                if(mineMatrix[row][col] !== 0 && mineMatrix[row][col] !== -1 &&
                    mineMatrix[row][col] !== 'M'){
                    //simply open the element
                    openCurrentElement(row, col);
                }

                //When clicked on a ZERO Element
                else if(mineMatrix[row][col] !== -1 && mineMatrix[row][col] !== 'M'){
                    openNeighbourZeros(row, col);
                }

                //When clicked on a mine
                else if(mineMatrix[row][col] === 'M'){
                    $.publish(mineClickTopic, null);
                }
    
            }
    
            function openCurrentElement(row, col){
                var elChild = document.querySelector("#" + elementId + " #r" + row + "-c" + col);
                var value = mineMatrix[row][col];
                if(value !== 0){
                    $(elChild).find("div").text(value);
                }
                if(elChild.className.indexOf("flagged") > -1){
                    $(elChild).removeClass("flagged");
                }
                mineMatrix[row][col] = -1; 
                elChild.style.background = "#ddd";
                elChild.removeEventListener("click", openElement);
    
                $(elChild).removeClass("closed");
                $(elChild).removeClass("opened");
    
    
                //Winning condition
                countElementsLeft--;
                if(countElementsLeft === 0){
                    alert("You won!");
                    var closedEls = document.querySelectorAll("#" + elementId + " .closed");
                    for(let i = 0; i < closedEls.length; i++){
                        closedEls[i].style.pointerEvents = "none";
                    }
                }
            }
            
            //Find all the nieghbouring zeros and open it.
            function openNeighbourZeros(row, col){
                openCurrentElement(row, col);
                var rowBefore, rowAfter, colBefore, colAfter;
                rowBefore = row - 1;
                rowAfter = row + 1;
                colBefore = col - 1;
                colAfter = col + 1;
    
                if(rowBefore > -1 && colBefore > -1){
                    checkCurrentElement(rowBefore, colBefore);
                }
                if(rowBefore > -1){
                    checkCurrentElement(rowBefore, col);
                }
                if(rowBefore > -1 && colAfter < size){
                    checkCurrentElement(rowBefore, colAfter);
                }
                if(colBefore > -1){
                    checkCurrentElement(row, colBefore);
                }
                if(colAfter < size){
                    checkCurrentElement(row, colAfter);
                }
                if(rowAfter < size && colBefore > -1){
                    checkCurrentElement(rowAfter, colBefore);
                }
                if(rowAfter < size){
                    checkCurrentElement(rowAfter, col);
                }
                if(rowAfter < size && colAfter < size){
                    checkCurrentElement(rowAfter, colAfter);
                }
            }
    
            function checkCurrentElement(row, col){
                if(mineMatrix[row][col] !== -1 && mineMatrix[row][col] !== 0){
                    openCurrentElement(row, col);
                    return;
                }
                if(mineMatrix[row][col] === 0){
                    openNeighbourZeros(row, col);
                }
            }
        }
    }

    //Alert message when a mine is clicked
    $.subscribe(mineClickTopic, function(){
        setTimeout(function(){
            alert("You've lost the game! :(");
        }, 100);
    });

    publicAPI = {
        renderUI: renderUI
    };
    return publicAPI;
}
