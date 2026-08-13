const InventoryRecord = require("../../models/InventoryRecord")
const mongoose = require("mongoose")

const sumUp = (inp1, inp2) => {
    return Number(inp1) + Number(inp2)
}

const reduceCount = (inp1, inp2) => {
    return Number(inp1) - Number(inp2)
}

const createInventory = async (stockId, openingStock) => {
    try {
        const createInv = await InventoryRecord.create({
            stock: stockId,
            openingstock: openingStock,
            closingstock: openingStock > 0 ? openingStock : 0,
            overalltotal: openingStock > 0 ? openingStock : 0
        })
    } catch (error) {
        console.log("Error", "The inevntory manager service is crashed", error?.message)
    }
}

const updateInventory = async (stockId, openingStock) => {
    try {
        const stId = new mongoose.Types.ObjectId(stockId)
        const updateInv = await InventoryRecord.findOne(
            { stock: stId }
        )
        if (updateInv) {
            if (Number(openingStock) != Number(updateInv?.openingstock)) {
                updateInv.openingstock = Number(openingStock)
                updateInv.closingstock = Number(openingStock) + updateInv?.quantity
                updateInv.overalltotal = updateInv?.closingstock
                updateInv.save()
            }
        }
    } catch (error) {
        console.log("Error", "The inevntory manager service is crashed", error?.message)
    }
}

// const qtyReducer = ()

const inventoryServices = async (datas, type) => {

    // This is made using FIFO Method --------------------------------------------------------

    try {
        if (type != "add" && type != "reduce") {
            return;
        }
        if (datas?.length > 0) {
            for (const pro of datas) {
                let findInv = await InventoryRecord.findOne({ stock: pro?.stock })

                if (findInv) {

                    if (type == "reduce") {

                        if (Number(findInv?.openingstock) >= Number(pro?.quantity)) {
                            findInv.openingstock = reduceCount(findInv?.openingstock, pro?.quantity)
                            findInv.closingstock = Number(findInv.quantity) + Number(findInv.openingstock)
                            findInv.overalltotal = Number(findInv.quantity) + Number(findInv.openingstock)
                            findInv.save()
                        } else {
                            if (Number(findInv?.openingstock) > 0) {
                                let findReminding = Number(pro?.quantity) - Number(findInv?.openingstock)
                                findInv.openingstock = 0
                                findInv.quantity = Number(findInv.quantity) - Number(findReminding)
                                findInv.closingstock = Number(findInv.quantity) + Number(findInv.openingstock)
                                findInv.overalltotal = Number(findInv.quantity) + Number(findInv.openingstock)
                                findInv.save()
                            } else {
                                findInv.quantity = Number(findInv.quantity) - Number(pro?.quantity)
                                findInv.closingstock = Number(findInv.quantity) + Number(findInv.openingstock)
                                findInv.overalltotal = Number(findInv.quantity) + Number(findInv.openingstock)
                                findInv.save()
                            }
                        }
                    }

                    if (type == "add") {

                        findInv.quantity = sumUp(findInv.quantity, pro?.quantity)
                        findInv.closingstock = Number(findInv.quantity) + Number(findInv.openingstock)
                        findInv.overalltotal = Number(findInv.quantity) + Number(findInv.openingstock)
                        findInv.save()

                    }

                } else {
                    const storeNew = await InventoryRecord.create({
                        stock: pro?.stock,
                        quantity: Number(pro?.quantity),
                        closingstock: Number(pro?.quantity),
                        overalltotal: Number(pro?.quantity)
                    })
                }
            }
        }
    } catch (error) {
        console.log("Error", "The inevntory manager service is crashed", error?.message)
    }
}

module.exports = { inventoryServices, sumUp, reduceCount, createInventory, updateInventory }