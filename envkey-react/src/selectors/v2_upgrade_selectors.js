import db from 'lib/db'

export const

  getIsStartingV2Upgrade = db.path("isStartingV2Upgrade"),

  getUpgradeV2Error = db.path("upgradeV2Error"),

  getV2UpgradeData = db.path("v2UpgradeData"),

  getV2UpgradeArchive = db.path("v2UpgradeArchive"),

  getV2CoreProcAlive = db.path("v2CoreProcAlive"),

  getV2CoreProcIsLoadingUpgrade = db.path("v2CoreProcIsLoadingUpgrade"),

  getV2CoreProcLoadedUpgrade = db.path("v2CoreProcLoadedUpgrade"),

  getV2UpgradeEnvkeys = db.path("v2UpgradeEnvkeys"),

  getV2CoreProcUpgradeStatus = db.path("v2CoreProcUpgradeStatus"),

  getV2CoreProcInviteTokensById = db.path("v2CoreProcInviteTokensById")