import { cRepeat, get_cOptions, curWndId_, OnFirefox, set_cPort } from "./store"
import {
  Tabs_, browser_, Q_, getGroupId, runtimeError_, selectTab, selectWndIfNeed, selectIndexFrom
} from "./browser"
import { showHUD, findCPort, safePost } from "./ports"

import C = kBgCmd

type TabGroup = chrome.tabGroups.TabGroup
type GroupInfo = BgVomnibarSpecialReq[kBgReq.omni_groupList]["g"][number]

const abs = Math.abs

const kGroupEditError = "Tabs cannot be edited right now"

/** Chrome may throw "Tabs cannot be edited right now" when grouping / ungrouping; retry for a while */
const retryGroupApi_ = (run: (callback: () => void) => void, onDone: (ok: boolean) => void, retries = 12): void => {
  run((): void => {
    const err = runtimeError_()
    if (err && retries > 0 && (err + "").includes(kGroupEditError)) {
      setTimeout((): void => { retryGroupApi_(run, onDone, retries - 1) }, 80)
      return
    }
    onDone(!err)
  })
}

const queryGroups_ = (): Promise<TabGroup[] | undefined> =>
    Q_(browser_.tabGroups.query, { windowId: curWndId_ })

const queryWndTabs_ = (): Promise<chrome.tabs.Tab[] | undefined> =>
    Q_(Tabs_.query, { windowId: curWndId_ })

/** the index of the first tab of a group, used to order groups by their position in the tab strip */
const firstTabIndexOfGroup_ = (tabs: readonly chrome.tabs.Tab[], groupId: number): number => {
  let min = tabs.length
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i]
    if (getGroupId(tab) === groupId && tab.index < min) { min = tab.index }
  }
  return min
}

const sortGroupsByStrip_ = (groups: TabGroup[], tabs: readonly chrome.tabs.Tab[]): TabGroup[] =>
    groups.slice().sort((a, b): number =>
        firstTabIndexOfGroup_(tabs, a.id) - firstTabIndexOfGroup_(tabs, b.id))

/** show a HUD on the page which hosts the given Vomnibar port */
const hudForOmni_ = (port: Port, text: string): void => {
  const cport = findCPort(port)
  if (cport) {
    set_cPort(cport)
    showHUD(text)
  }
}

export const nextTabGroup = (resolve: OnCmdResolved): void | kBgCmd.nextTabGroup => {
  goToTabGroup_(resolve, true)
}

export const previousTabGroup = (resolve: OnCmdResolved): void | kBgCmd.previousTabGroup => {
  goToTabGroup_(resolve, false)
}

const goToTabGroup_ = (resolve: OnCmdResolved, isNext: boolean): void => {
  if (OnFirefox) {
    showHUD("Tab groups are not supported on Firefox.")
    resolve(0)
    return
  }
  void Promise.all([queryGroups_(), queryWndTabs_()]).then(([groups, tabs]): void => {
    if (!groups || !groups.length || !tabs || !tabs.length) { resolve(0); return }
    const sorted = sortGroupsByStrip_(groups, tabs)
    const activeTab = tabs[selectIndexFrom(tabs)]
    let curInd = -1
    const activeGroupId = getGroupId(activeTab)
    if (activeGroupId != null) {
      curInd = sorted.findIndex((g): boolean => g.id === activeGroupId)
    }
    if (curInd < 0) {
      // the active tab is not in a group: use the nearest group to the left of it
      const activeIndex = activeTab.index
      let best = -1, bestIndex = -1
      for (let i = 0; i < sorted.length; i++) {
        const ind = firstTabIndexOfGroup_(tabs, sorted[i].id)
        if (ind < activeIndex && ind > bestIndex) { bestIndex = ind; best = i }
      }
      curInd = best
    }
    const count = abs(cRepeat)
    let target: number
    if (curInd < 0) {
      target = isNext ? 0 : sorted.length - 1
    } else {
      const step = isNext ? count : -count
      target = (curInd + step) % sorted.length
      target = target < 0 ? target + sorted.length : target
    }
    const targetGroup = sorted[target]
    let firstTab: chrome.tabs.Tab | undefined
    for (const tab of tabs) {
      if (getGroupId(tab) === targetGroup.id && (!firstTab || tab.index < firstTab.index)) { firstTab = tab }
    }
    if (!firstTab) { resolve(0); return }
    selectTab(firstTab.id, (tab): void => {
      if (runtimeError_() || !tab) { resolve(0); return }
      selectWndIfNeed(tab)
      resolve(1)
    })
    if (get_cOptions<C.nextTabGroup>().collapseOthers) {
      for (const group of sorted) {
        const collapsed = group.id !== targetGroup.id
        if (group.collapsed !== collapsed) {
          browser_.tabGroups.update(group.id, { collapsed }, runtimeError_)
        }
      }
    }
  })
}

export const toggleTabGroupCollapsed = (resolve: OnCmdResolved): void | kBgCmd.toggleTabGroupCollapsed => {
  if (OnFirefox) {
    showHUD("Tab groups are not supported on Firefox.")
    resolve(0)
    return
  }
  void Promise.all([queryGroups_(), queryWndTabs_()]).then(([groups, tabs]): void => {
    if (!groups || !groups.length || !tabs || !tabs.length) { resolve(0); return }
    const activeTab = tabs[selectIndexFrom(tabs)]
    let groupId = getGroupId(activeTab)
    if (groupId == null) {
      // nearest group to the left of the active tab
      const activeIndex = activeTab.index
      let best: number | null = null, bestIndex = -1
      for (const g of sortGroupsByStrip_(groups, tabs)) {
        const ind = firstTabIndexOfGroup_(tabs, g.id)
        if (ind < activeIndex && ind > bestIndex) { bestIndex = ind; best = g.id }
      }
      if (best == null) { resolve(0); return }
      groupId = best
    }
    void Q_(browser_.tabGroups.get, groupId as number).then((group): void => {
      if (!group) { resolve(0); return }
      const forced = get_cOptions<C.toggleTabGroupCollapsed>().collapsed
      const collapsed = forced != null ? !!forced : !group.collapsed
      if (collapsed === group.collapsed) { resolve(1); return }
      browser_.tabGroups.update(group.id, { collapsed }, (): void => {
        const err = runtimeError_()
        if (!err) { showHUD(collapsed ? "Collapsed the tab group." : "Expanded the tab group.") }
        resolve(err ? 0 : 1)
      })
    })
  })
}

export const ungroupTabs = (resolve: OnCmdResolved): void | kBgCmd.ungroupTabs => {
  if (OnFirefox) {
    showHUD("Tab groups are not supported on Firefox.")
    resolve(0)
    return
  }
  void queryWndTabs_().then((tabs): void => {
    if (!tabs || !tabs.length) { resolve(0); return }
    const curInd = selectIndexFrom(tabs)
    const activeTab = tabs[curInd]
    let ids: number[]
    if (get_cOptions<C.ungroupTabs>().all) {
      const groupId = getGroupId(activeTab)
      if (groupId == null) { resolve(0); return }
      ids = tabs.filter((t): boolean => getGroupId(t) === groupId).map((t): number => t.id)
    } else {
      const count = Math.min(abs(cRepeat), tabs.length - curInd)
      ids = tabs.slice(curInd, curInd + count)
          .filter((t): boolean => getGroupId(t) != null).map((t): number => t.id)
    }
    if (!ids.length) { resolve(0); return }
    retryGroupApi_((cb): void => { Tabs_.ungroup(ids, cb) }, (ok): void => {
      if (ok) {
        showHUD(ids.length > 1 ? `Ungrouped ${ids.length} tabs.` : "Ungrouped 1 tab.")
      }
      resolve(ok ? 1 : 0)
    })
  })
}

/** entry for kFgReq.omniGroup from the Vomnibar page */
export const onOmniGroup_ = (req: FgReq[kFgReq.omniGroup], port: Port): void => {
  if (OnFirefox) {
    hudForOmni_(port, "Tab groups are not supported on Firefox.")
    return
  }
  if (req.a === "list") {
    omniGroupList_(port)
  } else if (req.a === "create") {
    omniGroupCreate_(req, port)
  } else if (req.a === "move") {
    omniGroupMove_(req, port)
  }
}

const omniGroupList_ = (port: Port): void => {
  void Promise.all([queryGroups_(), queryWndTabs_()]).then(([groups, tabs]): void => {
    const list: GroupInfo[] = (groups || []).map((g): GroupInfo => ({
      id: g.id,
      title: g.title || "",
      color: g.color,
      collapsed: g.collapsed,
      tabCount: (tabs || []).reduce((count, t): number => count + (getGroupId(t) === g.id ? 1 : 0), 0)
    }))
    safePost(port, { N: kBgReq.omni_groupList, g: list })
  })
}

const omniGroupCreate_ = (req: FgReq[kFgReq.omniGroup], port: Port): void => {
  const tabIds = req.t || []
  if (!tabIds.length) { return }
  let newGroupId = -1
  // group then rename in one async chain, so a SW termination can not leave partial state
  retryGroupApi_((cb): void => {
    Tabs_.group({ tabIds }, (groupId: number): void => { newGroupId = groupId; cb() })
  }, (ok): void => {
    if (!ok || newGroupId < 0) {
      hudForOmni_(port, "Failed to create a tab group.")
      return
    }
    const title = req.i || ""
    const after = (): void => {
      hudForOmni_(port, title ? `Created group "${title}".` : `Created a tab group with ${tabIds.length} tabs.`)
    }
    if (title) {
      browser_.tabGroups.update(newGroupId, { title }, (): void => { runtimeError_(); after() })
    } else {
      after()
    }
  })
}

const omniGroupMove_ = (req: FgReq[kFgReq.omniGroup], port: Port): void => {
  const tabIds = req.t || [], groupId = req.g
  if (!tabIds.length || groupId == null) { return }
  retryGroupApi_((cb): void => {
    Tabs_.group({ tabIds, groupId }, cb)
  }, (ok): void => {
    hudForOmni_(port, ok
        ? (tabIds.length > 1 ? `Moved ${tabIds.length} tabs.` : "Moved 1 tab.")
        : "Failed to move tabs.")
  })
}
