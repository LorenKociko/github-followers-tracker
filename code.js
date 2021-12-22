const followersElement = document.getElementById("followersList")
const followingElement = document.getElementById("followingList")
let followersList = []
let followingList = []
let morePagesFlag = false

function main() {
    const username = document.getElementById("inputedUsername").value
    getFollowers(username)
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

async function getFollowers(username) {
    let followersUrl = `https://api.github.com/users/${username}/followers?per_page=100&page=`
    let followingUrl = `https://api.github.com/users/${username}/following?per_page=100&page=`
    followersList = await completeFetch(followersUrl)
    followingList = await completeFetch(followingUrl)

    let previousData = loadLocalStorage(username.toLowerCase())
    if (previousData) {
        let deletedFollowing = previousData.followingList.filter(x => !followingList.some(y => x.id === y.id))
        let addedFolloing = followingList.filter(x => !previousData.followingList.some(y => x.id === y.id))
        let deletedFollowers = previousData.followersList.filter(x => !followersList.some(y => x.id === y.id))
        let addedFollowers = followersList.filter(x => !previousData.followersList.some(y => x.id === y.id))
        console.log(deletedFollowing)
        console.log(addedFolloing)
        console.log(deletedFollowers)
        console.log(addedFollowers)
    } else {
        saveLocalStorage(username.toLowerCase())
    }



    followersElement.innerHTML = `<li><h2>Followers: ${followersList.length}</h2></li>`
    followingElement.innerHTML = `<li><h2>Following: ${followingList.length}</h2></li>`
    fillList(followersElement, followersList)
    fillList(followingElement, followingList)
    console.log(followersList)
    console.log(followingList)
        // let common = followersList.filter(value => followingList.some(value2 => value.id === value2.id));
        // console.log(common);
}


async function fetchGit(url, page = 1) {
    return await fetch(url + page).then(response => {
        return response.json()
    })
}


function localStorageManage(username) {
    if (!localStorage[username]) {
        let obj = {}
        obj["followersList"] = followersList
        obj["followingList"] = followingList
        obj["date"] = new Date().toLocaleString()
        localStorage.setItem(`${username}`, JSON.stringify(obj))
    } else {
        console.log("we got an entry")

    }
    return
}

function saveLocalStorage(username) {
    let obj = {}
    obj["followersList"] = followersList
    obj["followingList"] = followingList
    obj["date"] = new Date().toLocaleString()
    localStorage.setItem(`${username}`, JSON.stringify(obj))
}

function loadLocalStorage(username) {
    if (localStorage[username]) {
        return JSON.parse(localStorage.getItem(`${username}`))
    }
    return
}

function fillList(parent, list) {
    for (let i = 0; i < list.length; i++) {
        let liElement = document.createElement("li")
        let divElement = document.createElement("div")
        divElement.classList.add("entry")
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

// function fillList(parent, list) {
//     for (let i = 0; i < list.length; i++) {
//         let liElement = document.createElement("li")
//         liElement.innerHTML = `<li><div class="entry"><img src="${list[i].avatar_url}" style="height: 40px; width: 40px;"><p class="name">${list[i].login}</p></div></li>`
//         parent.appendChild(liElement)
//     }
// }