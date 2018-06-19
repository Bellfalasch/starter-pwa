/**
 * 1. global variables 
 * 2. Todo class // NOTE: move this out to another file  
 * 2. functions 
 * 3. listeners
 */

// BUG: remove only runs once. Figure out. 


var $ = require("jquery");

let registeredTodos = [];

/**
 * Model of a TodoItem 
 */
class TodoItem {
    /**
     * 
     * @param {string} text 
     * @param {string} date
     * @param {boolean} isChecked 
     */
    constructor(text, date, isChecked) {
        this.text = text; 
        this.date = date; 
        this.isChecked = isChecked; 
        this.id = Math.random(1, 1000); // NOTE: endre senere 
    }

    getFormattedDate() {
        return this.date.getDate() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getFullYear();
    }
}

/**
 * Search for TodoItem and use callback 
 */
let searchAndApply = (todoItem, callback) => {
    for(let i in registeredTodos) {
        if (registeredTodos[i].text + " - " + todoItem.text && todoItem.date === registeredTodos[i].getFormattedDate()) {
            callback(registeredTodos[i]); 
        }
    }
}

/**
 * Adds a todo to the lsit 
 */
let addTodo = () => {
    const date = new Date();
    const inputfield = document.getElementById("add-todo-text");
    

    // Only add if user actually entered something 
    if (inputfield.value !== "") {
        const item = new TodoItem(inputfield.value, date, false);
        console.log(item); 
        registeredTodos.push(item); 
        
        postApiCall(
            "/app/com.enonic.starter.pwa/_/service/com.enonic.starter.pwa/background-sync",
            {   text: inputfield.value,
                date : item.date,  
                isChecked : item.isChecked,
                id: item.id
            }
        );
        
        updateTodoView();
        updateRemoveListeners();
        updateCheckListeners();  
        inputfield.value = "";
    } else {
        // let user know something was wrong 
        inputfield.style.border = "solid red";
        setTimeout(() => {
            inputfield.style.border = "";
        }, 500);
    }
}

/**
 * Removes the item associated with the clicked button 
 */
let removeTodo = (event) => {   
    /**
     * Find the element with DOM api 
     * Loop through register. 
     * Update view 
     */
    const text = event.target.parentNode.children[0].innerHTML;
    const date = event.target.parentNode.children[1].innerHTML; 
    const removed = new TodoItem(text, date); // search for this 
    
    for(let i in registeredTodos){
        if (registeredTodos[i].text + " - " + removed.text && removed.date === registeredTodos[i].getFormattedDate()) {
            deleteApiCall(
                "/app/com.enonic.starter.pwa/_/service/com.enonic.starter.pwa/background-sync", 
                registeredTodos[i]);
            registeredTodos.splice(i, 1);
            updateTodoView();
            updateRemoveListeners();
            updateCheckListeners();
            return; //do not check more items than neccecary
        }
    }    
}

/**
 * Updates the list view 
 * NOTE: Updates all elements regardless. Must be imrpoved later 
 */
let updateTodoView = () => {
    let outputArea = document.getElementById("todo-app__item-area");
    //no duplicate renders
    outputArea.innerHTML = ""; 

    for (todo of registeredTodos) {
        outputArea.innerHTML += `
            <div class="todo-app__item">
                <input class="todo-app__checkbox" type="checkbox">
                <div style="text-decoration:${todo.isChecked ? "line-through" : "none"}">
                    <div>${todo.text}</div>
                    <div>${todo.getFormattedDate()}</div>
                    <button class="remove-todo-button">Remove</button>
                </div>
            </div>
        `;
    }
}



let checkTodo = (checkboxElement) => {
    console.log("checkTodo kjører"); 
    console.log(checkboxElement); 
    const htmlContent = checkboxElement.parentNode.children[1];
                                // Text           Date
    const todoItem = new TodoItem(htmlContent[0], htmlContent[1], checkboxElement.checked);
    searchAndApply(todoItem, todoItem.isChecked = !checkbox.isChecked);
    console.log(todoItem.isChecked); 
    updateTodoView(); 
    updateCheckListeners(); 
}


let updateRemoveListeners = () => {
    for (button of document.getElementsByClassName("remove-todo-button")) {
        button.onclick = removeTodo;
    }
}

let updateCheckListeners = () => {    
    const checkboxes = document.getElementsByClassName("todo-app__checkbox"); 
    if(checkboxes) {
        for (checkbox of checkboxes) {
            checkbox.onchange = () => { // separate this part to another function 
                checkTodo(checkbox); 
            }
        }
    }
}


// Listeners
document.getElementById("add-todo-button").onclick = addTodo;
document.onkeydown = (event) => {
                        //enter
    if(event.keyCode === 13) {
        addTodo(); 
    }
}

/**
 * Post data to an API endpoint. If successful (as in, HTTP call was successful, but the response may contain warnings, error messages etc),
 * trigger callbackSuccess with the response object. If not, trigger callbackFailure with the error.
 */
function postApiCall(url, data) {
    $.post({
        url: url,
        data: data,
        dataType: "json",
    })
}

function deleteApiCall(url, data) {
  $.ajax({
    url: url, 
    data : data,
    dataType: "json",
    type: "get"
  }).then((result) => {console.log(result)});
}

