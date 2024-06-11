export function saveData(photo, userName) {
    return {
        type: "SAVE_DATA",
        payload: {
            photo: photo,
            userName: userName
        }
    }
}

export function onFileLoaded (photo) {
    return {
        type: "LOAD_FILE",
        payload: {
            photo: photo
        }
    }
}
export function addWishToList( wishTitle, wishPrice) {
    return {
      type: 'ADD_WISH_TO_LIST',
      payload: {
            wishTitle: wishTitle, 
            wishPrice: wishPrice
      }
    }
}

export function removeWishFromList(wishItemId) {
    return {
      type: 'REMOVE_WISH_FROM_LIST',
      payload: {
        wishItemId: wishItemId
      }
    }
}

export function addTaskToList( taskTitle, taskPrice) {
    return {
      type: 'ADD_TASK_TO_LIST',
      payload: {
            taskTitle: taskTitle, 
            taskPrice: taskPrice
      }
    }
}

export function removeTaskFromList(taskItemId) {
    return {
      type: 'REMOVE_TASK_FROM_LIST',
      payload: {
        taskItemId: taskItemId
      }
    }
}

export function takeMoneyForWish(price) {
    return {
      type: 'TAKE_MONEY_FOR_WISH',
      payload: { 
        wishPrice: price
      }
    }
}

export function takeMoneyFromWallet(price) {
    return {
      type: 'TAKE_MONEY_FROM_WALLET',
      payload: { 
        taskPrice: price
      }
    }
}

export function addMoneyToWallet(price) {
    return {
      type: 'ADD_MONEY_TO_WALLET',
      payload: {
        taskPrice: price
      }
    }
}