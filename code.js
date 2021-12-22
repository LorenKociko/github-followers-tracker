const followersElement = document.getElementById("followersList")
const followingElement = document.getElementById("followingList")
const msg = document.getElementById("msg")
const searchbtn = document.getElementById("searchbtn")
const showall = document.getElementById("showall")
const showchanges = document.getElementById("showchanges")
const save = document.getElementById("save")

let followersList = []
let followingList = []
let morePagesFlag = false

let deletedFollowing = []
let addedFolloing = []
let deletedFollowers = []
let addedFollowers = []

document.getElementById("inputedUsername").addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        main()
    }
})
searchbtn.addEventListener('click', main)
showall.addEventListener('click', showAll)
showchanges.addEventListener('click', showChanges)

function main() {
    showall.disabled = true
    showchanges.disabled = true
    save.disabled = true
    const username = document.getElementById("inputedUsername").value.toLowerCase()
    save.addEventListener('click', () => { saveLocalStorage(username) })
    getFollowers(username)
}


async function getFollowers(username) {
    let followersUrl = `https://api.github.com/users/${username}/followers?per_page=100&page=`
    let followingUrl = `https://api.github.com/users/${username}/following?per_page=100&page=`
    followersList = await completeFetch(followersUrl)
    followingList = await completeFetch(followingUrl)

    let previousData = loadLocalStorage(username)
    if (previousData) {
        deletedFollowing = previousData.followingList.filter(x => !followingList.some(y => x.id === y.id))
        addedFolloing = followingList.filter(x => !previousData.followingList.some(y => x.id === y.id))
        deletedFollowers = previousData.followersList.filter(x => !followersList.some(y => x.id === y.id))
        addedFollowers = followersList.filter(x => !previousData.followersList.some(y => x.id === y.id))
        msg.innerText = `Last entry for this user was on ${previousData.date}.`
        showChanges()
        showall.disabled = false
        showchanges.disabled = false
        save.disabled = false
    } else {
        saveLocalStorage(username)
        msg.innerText = `The user ${username} has been added to your tracker.`
        showAll()
        showall.disabled = false
    }
    // let common = followersList.filter(value => followingList.some(value2 => value.id === value2.id));
}

async function completeFetch(url) {
    let page = 0
    let templist = []
    let result = []
    do {
        morePagesFlag = false
        page++
        templist = []
        templist = await fetchGit(url, page)
        result.push(...templist)
        if (templist.length === 100) {
            morePagesFlag = true
        }
    } while (morePagesFlag)
    return result
}

async function fetchGit(url, page = 1) {
    return await fetch(url + page).then(response => {
        return response.json()
    })
}

function saveLocalStorage(username) {
    let obj = {}
    obj["followersList"] = followersList
    obj["followingList"] = followingList
    obj["date"] = new Date().toLocaleString()
    localStorage.setItem(username, JSON.stringify(obj))
    msg.innerText = "Saved!"
}

function loadLocalStorage(username) {
    if (localStorage[username]) {
        return JSON.parse(localStorage.getItem(username))
    }
    return
}

function showChanges() {
    msg.innerText = `Last Changes`
    followersElement.innerHTML = `<li><h2>Followers: ${deletedFollowers.length+addedFollowers.length}</h2></li>`
    followingElement.innerHTML = `<li><h2>Following: ${deletedFollowing.length+addedFolloing.length}</h2></li>`
    fillList(followingElement, deletedFollowing, "deleted")
    fillList(followingElement, addedFolloing, "added")
    fillList(followersElement, deletedFollowers, "deleted")
    fillList(followersElement, addedFollowers, "added")
}

function showAll() {
    msg.innerText = `All Followers / Following`
    followersElement.innerHTML = `<li><h2>Followers: ${followersList.length}</h2></li>`
    followingElement.innerHTML = `<li><h2>Following: ${followingList.length}</h2></li>`
    fillList(followersElement, followersList)
    fillList(followingElement, followingList)
}

function fillList(parent, list, className = undefined) {
    for (let i = 0; i < list.length; i++) {
        let liElement = document.createElement("li")
        let divElement = document.createElement("div")
        divElement.classList.add("entry")
        if (className) {
            divElement.classList.add(`${className}`)
        }
        let imgElement = document.createElement("img")
        imgElement.src = list[i].avatar_url
        imgElement.style.height = "40px"
        imgElement.style.width = "40px"
        let nameElement = document.createElement("p")
        nameElement.classList.add("name")
        nameElement.innerText = list[i].login
        divElement.appendChild(imgElement)
        divElement.appendChild(nameElement)
        liElement.appendChild(divElement)
        parent.appendChild(liElement)
    }
}