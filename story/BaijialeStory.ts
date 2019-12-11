/**
* name 牛牛剧情
*/
module gamebaijiale.story {
	const enum MAP_STATUS {
		PLAY_STATUS_NONE = 0, // 准备阶段
		PLAY_STATUS_GAMESTART = 1, // 游戏开始
		PLAY_STATUS_PUSH_CARD = 2, // 发牌阶段
		PLAY_STATUS_BET = 3,// 下注阶段
		PLAY_STATUS_SHOW_CARD = 4, // 开牌阶段
		PLAY_STATUS_ADD_CARD = 5, // 补牌阶段
		PLAY_STATUS_SETTLE = 6, // 结算阶段
		PLAY_STATUS_RELAX = 7, // 休息阶段
	}
	export class BaijialeStory extends gamecomponent.story.StoryBaiRenBase {
		private _baijialeMgr: BaijialeMgr;
		private _winnerIndex: number;
		private _curStatus: number;
		private _baijialeMapInfo: BaijialeMapInfo;
		private _dealCards: Array<number> = [];
		private _openCards: Array<number> = [];
		private _isFaPai: boolean;
		private _cardsTemp: any = [];	//牌数据
		private _addCardType: number;
		constructor(v: Game, mapid: string, maplv: number) {
			super(v, mapid, maplv);
			this.init();
		}

		get baijialeMgr() {
			return this._baijialeMgr;
		}

		init() {
			if (!this._baijialeMgr) {
				this._baijialeMgr = new BaijialeMgr(this._game);
			}
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.on(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
			this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_ADD_CARD_TYPE, this, this.onUpdateCardType);//补牌类型

			this.onIntoNewMap();
		}

		private onIntoNewMap(info?: MapAssetInfo): void {
			if (!info) return;
			this.onMapInfoChange();
			this._game.uiRoot.closeAll();
			this._game.uiRoot.HUD.open(BaijialePageDef.PAGE_BAIJIALE_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._baijialeMapInfo = mapinfo as BaijialeMapInfo;
			if (mapinfo) {
				this.onUpdateState();
				this.cardsReDeal();
				this.onUpdateBattle();
			}
		}

		private onUpdateState(): void {
			if (!this._baijialeMapInfo) return;
			let mapStatus = this._baijialeMapInfo.GetMapState();
			if (this._curStatus == mapStatus) return;
			this._curStatus = mapStatus;
			switch (this._curStatus) {
				case MAP_STATUS.PLAY_STATUS_NONE:// 准备阶段
					this.serverClose();
					break;
				case MAP_STATUS.PLAY_STATUS_GAMESTART:// 游戏开始

					break;
				case MAP_STATUS.PLAY_STATUS_PUSH_CARD:// 发牌阶段
					this.cardsDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
					this.cardsReDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_SHOW_CARD:// 开牌阶段
					this._baijialeMgr.isReConnect = false;
					this.cardsReDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_ADD_CARD:// 补牌阶段
					this.cardsReDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段
					this.cardsReDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_RELAX:// 休息阶段
					this._index = 0;
					this._isFaPai = false;
					break;
			}
		}

		private onUpdateCardType(): void {
			this._addCardType = this._baijialeMapInfo.GetAddCardType();
		}

		createObj() {
			let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, BaijialeData) as BaijialeData;
			card.pos = new Vector2(850, 175);
			return card;
		}

		//正常游戏发牌
		private cardsDeal(): void {
			if (this._isFaPai) return;
			let cards = [0, 0, 0, 0];
			let handle = new Handler(this, this.createObj);
			this._baijialeMgr.Init(cards, handle);
			this._baijialeMgr.isDealCard();
			this._baijialeMgr.sort();
			this._baijialeMgr.fapai();
			this._isFaPai = true;
		}

		//断线重连,重发下牌
		private cardsReDeal(): void {
			if (!this._baijialeMapInfo) return;
			if (this._isFaPai) return;
			let status = this._game.sceneObjectMgr.mapInfo.GetMapState();
			//未开牌前，只发4张
			if (status > MAP_STATUS.PLAY_STATUS_PUSH_CARD && status < MAP_STATUS.PLAY_STATUS_RELAX) {
				this._cardsTemp = [0, 0, 0, 0];
				let handle = new Handler(this, this.createObj);
				this._baijialeMgr.Init(this._cardsTemp, handle);
				this._baijialeMgr.isDealCard();
				this._baijialeMgr.sort();
				this._baijialeMgr.refapai();
				this._isFaPai = true;
			}
		}

		//战斗结构体 出牌
		private _index: number = 0;
		private onUpdateBattle(): void {
			if (!this._baijialeMapInfo) return;
			let battleInfoMgr = this._baijialeMapInfo.battleInfoMgr;
			let handle = new Handler(this, this.createObj);
			this._openCards = [];
			for (let i = 0; i < battleInfoMgr.info.length; i++) {
				if (i < this._index) continue;
				let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (battleInfo instanceof gamecomponent.object.BattleInfoDeal) {	//发牌
					let cards = battleInfo.Cards;
					let index = battleInfo.SeatIndex - 1;
					if (this._baijialeMgr.isReConnect && this._curStatus >= MAP_STATUS.PLAY_STATUS_SHOW_CARD) {
						this._baijialeMgr.setValue(cards, index);
					} else {
						Laya.timer.once(1200 + 500 * index, this, () => {
							if (this._baijialeMgr) {
								this._baijialeMgr.setOneValue(cards, index, 0);
							}
						})
						Laya.timer.once(1700 + 1800 * battleInfo.SeatIndex, this, () => {
							if (this._baijialeMgr) {
								this._baijialeMgr.setOneValue(cards, index, 1);
							}
						})
					}
				}
				else if (battleInfo instanceof gamecomponent.object.BattleInfoAsk) {	//补牌
					let card = battleInfo.Card;
					let cardIdx = battleInfo.SeatIndex;

					let timeCount = battleInfo.SeatIndex;
					if (this._addCardType == 1 || this._addCardType == 2) {
						timeCount = 1;
					}
					if (this._baijialeMgr.isReConnect && this._curStatus >= MAP_STATUS.PLAY_STATUS_ADD_CARD) {
						this._baijialeMgr.addCard(card, handle, cardIdx, 2, true);
					} else {
						Laya.timer.once(2000 * (timeCount - 1), this, () => {
							if (this._baijialeMgr) {
								this._baijialeMgr.addCard(card, handle, cardIdx, 2, false);
							}
							this._game.playSound(StringU.substitute(Path_game_baijiale.music_baijiale + "{0}.mp3", cardIdx == 1 ? "xian" : "zhuang"), false);
						})

						Laya.timer.once(500 + 2000 * (timeCount - 1), this, () => {


							this._game.playSound(Path_game_baijiale.music_baijiale + "bupai.mp3", false);
						})
					}
				}
				this._index++;
			}

		}

		enterMap() {
			//各种判断
			this._game.network.call_match_game(this._mapid, this.maplv);
			return true;
		}

		leavelMap() {
			//各种判断
			this._game.network.call_leave_game();
			return true;
		}

		clear() {

			this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.off(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
			this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_ADD_CARD_TYPE, this, this.onUpdateCardType);//补牌类型

			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			if (this._baijialeMgr) {
				this._baijialeMgr.clear();
				this._baijialeMgr = null;
			}
			this._baijialeMapInfo = null;
		}

		update(diff: number) {

		}
	}
}