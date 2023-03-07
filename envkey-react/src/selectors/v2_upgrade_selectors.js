import db from 'lib/db'

export const

  getIsStartingV2Upgrade = db.path("isStartingV2Upgrade"),

  getIsCancelingV2Upgrade = db.path("isCancelingV2Upgrade"),

  getCanceledV2Upgrade = db.path("canceledV2Upgrade"),

  getIsFinishingV2Upgrade = db.path("isFinishingV2Upgrade"),

  getUpgradeV2Error = db.path("upgradeV2Error"),

  getV2UpgradeData = db.path("v2UpgradeData"),

  getV2UpgradeArchive = db.path("v2UpgradeArchive"),

  getV2CoreProcAlive = db.path("v2CoreProcAlive"),

  getV2CoreProcIsLoadingUpgrade = db.path("v2CoreProcIsLoadingUpgrade"),

  getV2CoreProcLoadedUpgrade = db.path("v2CoreProcLoadedUpgrade"),

  getV2UpgradeEnvkeys = db.path("v2UpgradeEnvkeys"),

  getV2CoreProcUpgradeStatus = db.path("v2CoreProcUpgradeStatus"),

  getV2CoreProcInviteTokensById = db.path("v2CoreProcInviteTokensById"),

  getIsAcceptingV2UpgradeInvite = db.path("isAcceptingV2UpgradeInvite"),

  getDidAcceptV2UpgradeInvite = db.path("didAcceptV2UpgradeInvite"),

  getAcceptV2UpgradeInviteError = db.path("acceptV2UpgradeInviteError"),

  getDidFinishV2Upgrade = db.path("didFinishV2Upgrade"),

  getDidFinishV2OrgUserUpgrade = db.path("didFinishV2OrgUserUpgrade"),

  getUpgradeToken = db.path("upgradeToken"),

  getEncryptedV2InviteToken = db.path("encryptedV2InviteToken"),

  getDidUpgradeV2At = db.path("didUpgradeV2At")