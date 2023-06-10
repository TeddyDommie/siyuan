import {hasClosestBlock, hasClosestByAttribute, hasClosestByClassName} from "../../util/hasClosest";
import {transaction} from "../../wysiwyg/transaction";
import {Menu} from "../../../plugin/API";
import {getIconByType} from "./render";
import {openEditorTab} from "../../../menus/util";
import {copySubMenu} from "../../../menus/commonMenuItem";
import {popTextCell} from "./cell";

const showHeaderCellMenu = (protyle: IProtyle, blockElement: HTMLElement, cellElement: HTMLElement) => {
    const type = cellElement.getAttribute("data-dtype") as TAVCol
    const menu = new Menu("av-header-cell");
    menu.addItem({
        icon: getIconByType(type),
        label: `<input style="margin: 4px 0" class="b3-text-field" type="text" value="${cellElement.innerText.trim()}">`,
        bind() {

        }
    });
    if (type !== "block") {
        menu.addItem({
            icon: "iconEdit",
            label: window.siyuan.languages.edit,
            click() {

            }
        });
    }
    menu.addSeparator();
    menu.addItem({
        icon: "iconUp",
        label: window.siyuan.languages.fileNameNatASC,
        click() {

        }
    });
    menu.addItem({
        icon: "iconDown",
        label: window.siyuan.languages.fileNameNatDESC,
        click() {

        }
    });
    menu.addItem({
        icon: "iconFilter",
        label: window.siyuan.languages.filter,
        click() {

        }
    });
    menu.addSeparator();
    if (type !== "block") {
        menu.addItem({
            icon: "iconEyeoff",
            label: window.siyuan.languages.hide,
            click() {

            }
        });
        menu.addItem({
            icon: "iconCopy",
            label: window.siyuan.languages.duplicate,
            click() {

            }
        });
        menu.addItem({
            icon: "iconTrashcan",
            label: window.siyuan.languages.delete,
            click() {
                const id = cellElement.getAttribute("data-id")
                transaction(protyle, [{
                    action: "removeAttrViewCol",
                    id,
                    parentID: blockElement.getAttribute("data-av-id"),
                }], [{
                    action: "addAttrViewCol",
                    name: cellElement.textContent.trim(),
                    parentID: blockElement.getAttribute("data-av-id"),
                    type: type,
                    id
                }]);
                removeCol(cellElement)
            }
        });
        menu.addSeparator();
    }
    menu.addItem({
        label: `<div class="fn__flex" style="margin-bottom: 4px"><span>${window.siyuan.languages.wrap}</span><span class="fn__space fn__flex-1"></span>
<input type="checkbox" class="b3-switch fn__flex-center"${cellElement.getAttribute("data-wrap") === "true" ? " checked" : ""}></div>`,
        click() {

        }
    });
    const cellRect = cellElement.getBoundingClientRect();
    menu.open({
        x: cellRect.left,
        y: cellRect.bottom,
        h: cellRect.height
    });
    (window.siyuan.menus.menu.element.querySelector(".b3-text-field") as HTMLInputElement)?.select();

};

export const avClick = (protyle: IProtyle, event: MouseEvent & { target: HTMLElement }) => {
    const blockElement = hasClosestBlock(event.target);
    const addElement = hasClosestByAttribute(event.target, "data-type", "av-header-add");
    if (addElement && blockElement) {
        const menu = new Menu("av-header-add");
        menu.addItem({
            icon: "iconAlignLeft",
            label: window.siyuan.languages.text,
            click() {
                const id = Lute.NewNodeID();
                const type = "text";
                transaction(protyle, [{
                    action: "addAttrViewCol",
                    name: "Text",
                    parentID: blockElement.getAttribute("data-av-id"),
                    type,
                    id
                }], [{
                    action: "removeAttrViewCol",
                    id,
                    parentID: blockElement.getAttribute("data-av-id"),
                }]);
                addCol(protyle, blockElement, id, type)
            }
        });
        const addRect = addElement.getBoundingClientRect();
        menu.open({
            x: addRect.left,
            y: addRect.bottom,
            h: addRect.height
        });
        event.preventDefault();
        event.stopPropagation();
        return true;
    }

    const cellElement = hasClosestByClassName(event.target, "av__cell");
    if (cellElement && blockElement) {
        if (cellElement.parentElement.classList.contains("av__row--header")) {
            showHeaderCellMenu(protyle, blockElement, cellElement)
            event.preventDefault();
            event.stopPropagation();
        } else {
            popTextCell(protyle, cellElement)
        }
        return true;
    }
    return false;
};

export const avContextmenu = (protyle: IProtyle, event: MouseEvent & { detail: any }, target: HTMLElement) => {
    const rowElement = hasClosestByClassName(target, "av__row");
    if (!rowElement) {
        return false;
    }
    const blockElement = hasClosestBlock(rowElement);
    if (!blockElement) {
        return false;
    }
    const rowId = rowElement.getAttribute("data-id");
    const menu = new Menu("av-row");
    menu.addItem({
        icon: "iconCopy",
        label: window.siyuan.languages.duplicate,
        click() {

        }
    });
    menu.addItem({
        icon: "iconTrashcan",
        label: window.siyuan.languages.delete,
        click() {
            transaction(protyle, [{
                action: "removeAttrViewBlock",
                id: blockElement.getAttribute("data-node-id"),
                parentID: blockElement.getAttribute("data-av-id"),
            }], [{
                action: "insertAttrViewBlock",
                id: blockElement.getAttribute("data-node-id"),
                parentID: blockElement.getAttribute("data-av-id"),
                previousID: rowElement.previousElementSibling?.getAttribute("data-id") || "",
                srcIDs: [rowId],
            }]);
            rowElement.remove();
        }
    });
    menu.addSeparator();
    openEditorTab(protyle.app, rowId);
    menu.addItem({
        label: window.siyuan.languages.copy,
        icon: "iconCopy",
        type: "submenu",
        submenu: copySubMenu(rowId)
    });
    menu.addSeparator();
    menu.addItem({
        icon: "iconEdit",
        label: window.siyuan.languages.edit,
        click() {

        }
    })
    const editAttrSubmenu: IMenu[] = []
    rowElement.parentElement.querySelectorAll(".av__row--header .av__cell").forEach((cellElement) => {
        editAttrSubmenu.push({
            icon: getIconByType(cellElement.getAttribute("data-dtype") as TAVCol),
            label: cellElement.textContent.trim(),
            click() {
            }
        })
    });
    menu.addItem({
        icon: "iconList",
        label: window.siyuan.languages.attr,
        type: "submenu",
        submenu: editAttrSubmenu
    })
    menu.open({
        x: event.clientX,
        y: event.clientY,
    });
    event.preventDefault();
    event.stopPropagation();
    return true;
}

const addCol = (protyle: IProtyle, blockElement: HTMLElement, id: string, type: TAVCol) => {
    let index = "0"
    blockElement.querySelectorAll(".av__row--header .av__cell").forEach((item) => {
        const dataIndex = item.getAttribute("data-index")
        if (dataIndex > index) {
            index = dataIndex
        }
    })
    blockElement.querySelectorAll(".av__row").forEach((item, index) => {
        let html = ''
        if (index === 0) {
            html = `<div class="av__cell" data-index="${index}" data-id="${id}" data-dtype="${type}" data-wrap="false" style="width: 200px;">
    <svg><use xlink:href="#iconAlignLeft"></use></svg>
    <span>Text</span>
</div>`
        } else {
            html = `<div class="av__cell" data-index="${index}" style="width: 200px;"></div>`
        }
        item.lastElementChild.insertAdjacentHTML("beforebegin", html)
    })
    showHeaderCellMenu(protyle, blockElement, blockElement.querySelector(".av__row--header").lastElementChild.previousElementSibling as HTMLElement)
}

const removeCol = (cellElement: HTMLElement) => {
    const index = cellElement.getAttribute("data-index")
    const blockElement = hasClosestBlock(cellElement);
    if (!blockElement) {
        return false;
    }
    blockElement.querySelectorAll(".av__row").forEach((item) => {
        item.querySelector(`[data-index="${index}"]`).remove;
    })
}


export const addAVRow = (blockElement: HTMLElement, ids: string[], previousID: string) => {
    const rowElement = previousID ? blockElement.querySelector(`[data-id=${previousID}]`) : blockElement.querySelector(".av__row--header")
    let html = ''
    ids.forEach((id) => {
        html += `<div class="av__row"><div class="av__firstcol"><svg><use xlink:href="#iconUncheck"></use></svg></div>`;
        Array.from(rowElement.children).forEach((item: HTMLElement, index) => {
            if (index === 0 || index === rowElement.childElementCount - 1) {
                return
            }
            html += `<div class="av__cell" data-index="${index}" style="width: ${item.style.width};>${id}</div>`;
        })
        html += "<div></div></div>";
    })
    rowElement.insertAdjacentHTML("afterend", html);
}
