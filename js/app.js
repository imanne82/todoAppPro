const $ = document
const containerModal = $.querySelector('#container-modal')
const contentModal = $.querySelector('#content-modal h2')
const input = $.querySelector('#input')
const containerTodo = $.querySelector('#section-todo')
const btnSendTodo = $.querySelector('#btn-send-todo')
const canselModal = $.querySelector('#cansel-modal')
const deleteTodoModal = $.querySelector('#delete-todo-modal')
const closedModal = $.querySelector('#closed-modal')
const containerEditInput = $.querySelector('#container-edit-input')
const canselEdit = $.querySelector('#cansel-edit')
const sendEdite = $.querySelector('#send-edite')
const inputEdit = $.querySelector('#input-edit')
let windowScrollY = null
window.onscroll = () => (windowScrollY = window.scrollY)

/*                 time todo                    */
function timeTodo() {
    const nowDate = new Date()
    let dateConversion = DateConversion(nowDate.getFullYear(), (nowDate.getMonth() + 1), nowDate.getDate())
    let weekDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    let dayName = weekDays[nowDate.getDay()];
    return [dateConversion, dayName]
}

function createTemplateTodo() {
    if (input.value) {
        const todo = {
            content: input.value,
            isDone: false,
            edited: false,
            time: timeTodo()[0],
            day: timeTodo()[1],
        }
        sendTodo(todo).then()
    } else {
        showModal('flex', 'کار روزانه ای وارد نکردید')
    }

}


/*       send todo                                 */

async function sendTodo(todo) {
    try {
        await fetch('https://apptodos-2a17c-default-rtdb.firebaseio.com/todoAppPro/todo.json', {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(todo)
        })
        input.value = ''
        showModal('flex', 'کار روزانه ی شما ثبت شد')
        await generateTodo()
    } catch (err) {
        input.value = todo.content
        showModal('flex', 'خطا دوباره تلاش کنید')
    }
}

/*            get todo                              */

async function getTodo() {
    try {
        let getApi = await fetch('https://apptodos-2a17c-default-rtdb.firebaseio.com/todoAppPro/todo.json')
        let conversionTodoJson = await getApi.json()
        return conversionTodoJson ? Object.entries(conversionTodoJson) : []
    } catch (err) {
        showModal('flex', 'لطفا با vpn وارد شوید')
    }
}

/*                 generate todo template                      */
async function generateTodo() {
    try {
        let fragment = $.createDocumentFragment()
        showModal('flex', 'در حال جمع آوری اطلاعات', 'none')
        let listTodo = await getTodo()
        let todos = null
        await listTodo.forEach((todo) => {
            todos = templateTodo(todo)
            fragment.append(todos)
        })
        containerTodo.append(fragment)
        closModal(undefined)
    } catch (err) {
        showModal('flex', 'لطفا با vpn وارد شوید')

    }
}

function templateTodo(content) {
    containerTodo.innerHTML = ''
    const todoContainer = document.createElement('div');
    todoContainer.classList.add('todo-container');
    todoContainer.id = content[0]
    const divTodo = document.createElement('div');
    divTodo.classList.add('div-todo');

    const todo = document.createElement('div');
    todo.classList.add('todo');
    const todoText = document.createElement('span');
    todoText.innerText = content[1].content
    todo.appendChild(todoText);

    const timeTodo = document.createElement('div');
    timeTodo.classList.add('time-todo');
    const edited = document.createElement('span');
    edited.classList.add('edited');
    edited.innerText = 'ویرایش شده';
    const date = document.createElement('span');
    date.innerText = content[1].time;
    const day = document.createElement('span');
    day.innerText = content[1].day;
    timeTodo.appendChild(edited);
    timeTodo.appendChild(date);
    timeTodo.appendChild(day);

    divTodo.appendChild(todo);
    divTodo.appendChild(timeTodo);

    const tools = document.createElement('div');
    tools.classList.add('tools');

    const deleteIcon = document.createElement('span');
    const deleteImg = document.createElement('img');
    deleteImg.src = 'img/icons8-delete-100.png';
    deleteImg.alt = 'icon-delete';
    deleteIcon.appendChild(deleteImg);

    const editIcon = document.createElement('span');
    const editImg = document.createElement('img');
    editImg.src = 'img/icons8-edit-64.png';
    editImg.alt = 'icon-edit';
    editIcon.appendChild(editImg);

    const checkIcon = document.createElement('span');
    const checkImg = document.createElement('img');
    checkImg.src = 'img/icons8-checked-48.png';
    checkImg.alt = 'icon-check';
    checkIcon.appendChild(checkImg);

    tools.appendChild(checkIcon);
    tools.appendChild(deleteIcon);
    tools.appendChild(editIcon);

    todoContainer.appendChild(divTodo);
    todoContainer.appendChild(tools);

    editIcon.addEventListener('click', () => {
        window.scrollTo(0, 0)
        openEditor(content)
    })
    deleteIcon.addEventListener('click', () => {
        window.scrollTo(0, 0)
        openDeletePage(content)
    })
    checkIcon.addEventListener('click', () => isFlag(content))
    checkTodo(content[1], edited, todoContainer, checkImg)
    return todoContainer
}

async function isFlag(todo) {
    todo[1].isDone ? await changeIsDone(todo, false) : await changeIsDone(todo, true)
}

async function changeIsDone(todo, isDone) {
    try {
        await fetch(`https://apptodos-2a17c-default-rtdb.firebaseio.com/todoAppPro/todo/${todo[0]}.json`, {
            method: 'PUT',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                content: todo[1].content,
                isDone: isDone,
                edited: todo[1].edited,
                time: todo[1].time,
                day: todo[1].day,
            })
        })
        showModal('flex', 'تغییرات ذخیره شد')
        await generateTodo()
    } catch (err) {
        showModal('flex', 'اتصال خود را بررسی کنید')
    }
}

function openDeletePage(todo) {
    showModal('flex', 'کار روزانه حذف شود ؟', 'none', 'block', 'block')
    let historyScroll = window.scrollY
    canselModal.onclick = () => {
        window.scrollTo(0, historyScroll)
    }
    let todoCo = $.querySelector(`#${todo[0]}`)
    todoCo.classList.add('bgDelete')
    canselModal.addEventListener('click', () => closModal(todoCo))
    deleteTodoModal.addEventListener('click', () => deleteTodo(todo[0]))
}

/*           delete todo                                      */
async function deleteTodo(todoId) {
    try {
        await fetch(`https://apptodos-2a17c-default-rtdb.firebaseio.com/todoAppPro/todo/${todoId}.json`, {
            method: 'DELETE'
        })
        await generateTodo()
        showModal('flex', 'با موفقیت حذف شد')
    } catch (err) {
        showModal('flex', 'لطفا دوباره تلاش کنید')
    }
}

/*          edited todo                                      */

function openEditor(todo) {
    containerEditInput.style.display = 'flex'
    inputEdit.value = todo[1].content
    sendEdite.addEventListener('click', () => editTodo(todo))
    let historyScroll = window.scrollY
    canselEdit.onclick = () => {
        window.scrollTo(0, historyScroll)
    }
}

async function editTodo(todo) {
    try {
        await fetch(`https://apptodos-2a17c-default-rtdb.firebaseio.com/todoAppPro/todo/${todo[0]}.json`, {
            method: 'PUT',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                content: inputEdit.value,
                isDone: todo[1].isDone,
                edited: true,
                time: todo[1].time,
                day: todo[1].day,
            })
        })
        containerEditInput.style.display = 'none'
        showModal('flex', 'تغییرات ذخیره شد')
        await generateTodo()
    } catch (err) {
        showModal('flex', 'لطفا مجدد تلاش کنید')
    }
}

/*           check todo                                      */

function checkTodo(todo, edited, containerTodo, checkImg) {
    todo.edited ? edited.style.display = 'block' : edited.style.display = 'none'
    if (todo.isDone) {
        containerTodo.classList.add('true')
        checkImg.src = 'img/icons8-multiplication-40.png'
    } else {
        containerTodo.classList.remove('true')
        checkImg.src = 'img/icons8-checked-48.png'
    }
}

/*                     modal                                                 */

function showModal(displayContainer, contentTodo, closBtn = 'block', delBtn = 'none', cancelBtn = 'none') {
    containerModal.style.display = displayContainer
    contentModal.innerHTML = contentTodo
    canselModal.style.display = cancelBtn
    deleteTodoModal.style.display = delBtn
    closedModal.style.display = closBtn
}

function closModal(todoId) {
    containerModal.style.display = 'none'
    todoId ? todoId.classList.remove('bgDelete') : {}
}

closedModal.addEventListener('click', () => closModal(undefined))
canselEdit.addEventListener('click', () => containerEditInput.style.display = 'none')
btnSendTodo.addEventListener('click', createTemplateTodo)
window.addEventListener('load', () => navigator.onLine ? generateTodo() : showModal('flex', 'اینترنت قطعه :/'))
input.addEventListener('keypress', (e) => e.keyCode === 13 ? createTemplateTodo() : {})