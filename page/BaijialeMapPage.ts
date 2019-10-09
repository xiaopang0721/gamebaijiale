/**
* 百家乐
*/
module gamebaijiale.page {
    import TextFieldU = utils.TextFieldU;
    const enum MAP_STATUS {
        PLAY_STATUS_NONE = 0, // 准备阶段
        PLAY_STATUS_GAMESTART = 1, // 游戏开始
        PLAY_STATUS_PUSH_CARD = 2, // 发牌阶段
        PLAY_STATUS_BET = 3,// 下注阶段
        PLAY_STATUS_SHOW_CARD = 4, // 开牌阶段
        PLAY_STATUS_ADD_CARD = 5, // 补牌阶段
        PLAY_STATUS_SETTLE = 6, // 结算阶段
        PLAY_STATUS_SHOW_INFO = 7, // 显示结算信息阶段
        PLAY_STATUS_RELAX = 8, // 休息阶段
    }
    const CARDS_TOTAL_COUNT = 416 // 8副牌总数
    const PLAYER_LEAST_MONEY = 20 // 投注最少携带金额
    const ALL_GAME_ROOM_CONFIG_ID = [141, 142, 143, 144];// 可进入的maplv
    const ROOM_CHIP_CONFIG = {
        "141": [1, 10, 50, 100, 1000],     //新手
        "142": [10, 50, 100, 500, 1000],   //小资
        "143": [50, 100, 500, 1000, 5000],  //老板
        "144": [100, 500, 1000, 5000, 10000],  //富豪
    };
    const ROBOT_NUM_CONFIG = {
        "141": [100, 150, 200, 300],     //新手
        "142": [70, 100, 130, 200],   //小资
        "143": [30, 60, 100, 150],  //老板
        "144": [10, 30, 60, 90],  //富豪
    };
    export class BaijialeMapPage extends game.gui.base.Page {
        static readonly MONEY_LIMIT_CONFIG = {
            "141": [5000, 2000, 5000],    //新手(上庄限制，入座限制，投注限额)
            "142": [20000, 5000, 8000],  //小资(上庄限制，入座限制，投注限额)
            "143": [50000, 10000, 25000],  //老板(上庄限制，入座限制，投注限额)
            "144": [100000, 20000, 50000],    //富豪(上庄限制，入座限制，投注限额)
        };

        private _viewUI: ui.nqp.game_ui.baijiale.BaiJiaLeUI;
        private _baijialeMgr: BaijialeMgr;
        private _baijialeStory: BaijialeStory;
        private _baijialeMapInfo: BaijialeMapInfo;
        private _mainPlayerBenefit: number = 0;//玩家收益
        private _betMainTotal: number = 0;//玩家总下注
        private _lottery: string = "";//中奖区域
        private _areaList: Array<any> = [];//下注区域UI集合
        private _areaKuangUIList: Array<any> = [];//下注区域边框集合
        private _txtTotalUIList: Array<any> = [];//总下注文本UI集合
        private _txtBetUIList: Array<any> = [];//玩家下注文本UI集合
        private _seatUIList: Array<any> = [];//座位UI集合
        private _chipUIList: Array<Button> = [];//筹码UI集合
        private _aniKaiList: Array<any> = [];//开牌ani集合
        private _chipGuangUIList: Array<LImage> = [];//筹码光效UI集合
        private _chipArr: Array<number> = [];//筹码大小类型
        private _cardsArr: Array<any> = [];//开牌信息集合
        private _clipList: Array<BaijialeClip> = [];//飘字集合
        private _robotConfig: any;//机器人配置
        private _szlimit: number;//上庄金币
        private _seatlimit: number;//入座金币
        private _betlimit: number;//投注限额
        private _curStatus: number;//当前地图状态
        private _countDown: number;//倒计时时间戳
        private _curChip: number;//当前选择筹码
        private _curChipY: number;//当前选择筹码y轴位置
        private _chipSortScore: number = 0;//筹码层级
        private _unitSeated: Array<any> = [];//入座精灵信息集合
        private _chipTotalList: Array<any> = [[], [], [], [], [], [], []];//区域绘制筹码集合
        private _betTotalList: Array<any> = [0, 0, 0, 0, 0, 0, 0];//区域下注总额集合（所有玩家）
        private _betMainList: Array<any> = [0, 0, 0, 0, 0, 0, 0];//区域下注总额集合（主玩家）
        private _rebetList: Array<number> = [0, 0, 0, 0, 0, 0, 0];//重复下注列表(7个区域)
        private _mainHeadPos: any = [[0, 0], [0, -10]];//主玩家座位头像初始位置
        private _headStartPos: any = [[0, 0], [0, 158], [0, 316], [0, 0], [0, 158], [0, 316]];//座位头像初始位置
        private _headEndPos: any = [[10, 0], [10, 158], [10, 316], [-10, 0], [-10, 158], [-10, 316]];//座位头像移动位置
        private _htmlText: laya.html.dom.HTMLDivElement;
        private _htmlTextArr: Array<laya.html.dom.HTMLDivElement>;
        private _isFirstOpen: boolean = false;
        private _addCardType: number = 0;//补牌类型
        private _turnClip: BaijialeClip;//局数

        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedDuang = false;
            this._delta = 1000;
            this._asset = [
                DatingPath.atlas_dating_ui + "qifu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "tuichu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/suiji.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general/effect/kaipai.atlas",
                Path_game_baijiale.atlas_game_ui + "baijiale.atlas",
                PathGameTongyong.ui_tongyong_sk + "HeGuan.png",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.baijiale.BaiJiaLeUI');
            this.addChild(this._viewUI);
            this.initView();
            if (!this._pageHandle) {
                this._pageHandle = PageHandle.Get("BaijialeMapPage");//额外界面控制器
            }
            this._baijialeStory = this._game.sceneObjectMgr.story as BaijialeStory;
            if (this._baijialeStory) {
                this._baijialeMgr = this._baijialeStory.baijialeMgr;
                if (this._baijialeMgr) {
                    this._baijialeMgr.on(BaijialeMgr.DEAL_OVER, this, this.onUpdateAniDeal);
                }
                this.onUpdateMapInfo();
            }
            this._viewUI.btn_spread.left = this._game.isFullScreen ? 30 : 10;
            this._viewUI.box_menu.left = this._game.isFullScreen ? 25 : 10;
            this._viewUI.mouseThrough = true;
            this._game.playMusic(Path_game_baijiale.music_baijiale + "bjl_bgm.mp3");
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            this._viewUI.btn_spread.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_back.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_rule.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_set.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_zhanji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_repeat.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_playerList.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_chongzhi.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_road.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_qifu.on(LEvent.CLICK, this, this.onBtnClickWithTween);


            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);

            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_GAME_TURN_CHANGE, this, this.onUpdateTurn);//回合数变化
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时时间戳更新
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_SEATED_LIST, this, this.onUpdateSeatedList);//入座列表更新
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_CARD_POOL_CHANGE, this, this.onUpdateCardPool);//牌库数量变化
            this._game.sceneObjectMgr.on(BaijialeMapInfo.EVENT_ADD_CARD_TYPE, this, this.onUpdateCardType);//补牌类型
            this._game.qifuMgr.on(QiFuMgr.QIFU_FLY, this, this.qifuFly);

            this.onUpdateUnitOffline();
            this.onUpdateSeatedList();
        }

        private _curDiffTime: number;
        update(diff: number) {
            super.update(diff);
            if (!this._curDiffTime || this._curDiffTime < 0) {
                this._viewUI.btn_chongzhi.ani1.play(0, false);
                this._curDiffTime = TongyongPageDef.CZ_PLAY_DIFF_TIME;
            } else {
                this._curDiffTime -= diff;
            }
        }

        //帧间隔心跳
        deltaUpdate() {
            let bool = this._curStatus == MAP_STATUS.PLAY_STATUS_BET || this._curStatus == MAP_STATUS.PLAY_STATUS_SETTLE;
            if (!bool) return;
            let curTime = this._game.sync.serverTimeBys;
            let time = Math.floor(this._countDown - curTime);
            this._viewUI.box_time.ani1.gotoAndStop(24);
            this._viewUI.box_time.visible = time > 0;
            this._viewUI.box_time.txt_time.text = time.toString();
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_BET) {
                if (time <= 3 && !this._viewUI.box_time.ani1.isPlaying) {
                    this._viewUI.box_time.ani1.play(1, true);
                }
                if (time > 3) {
                    this._viewUI.box_time.ani1.gotoAndStop(24);
                }

                if (time == 1) {
                    this._game.playSound(PathGameTongyong.music_tongyong + "time2.mp3", false);
                } else if (time == 2 || time == 3) {
                    this._game.playSound(PathGameTongyong.music_tongyong + "time1.mp3", false);
                }
            }
        }

        //玩家进来了
        private onUnitAdd(u: Unit) {
            this.onUpdateUnit();
        }

        //玩家出去了
        private onUnitRemove(u: Unit) {
            this.onUpdateUnit();
        }

        private onUpdateAniDeal(): void {
            this._viewUI.paixieRight.ani2.gotoAndStop(0);
        }

        // 刷新点数
        private onUpdateCount(index: number): void {
            if (this._cardsArr && !this._cardsArr.length) return;
            if (!index) {//计算闲家点数
                let xianCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[0]);
                let xianCount = 0;
                for (let i = 0; i < xianCards.length; i++) {
                    xianCount += xianCards[i].GetCardCount();
                }
                xianCount = xianCount % 10;
                this._viewUI.clip_xian.index = xianCount;
                this._viewUI.box_xian.visible = true;
            } else {//计算庄家点数
                let zhuangCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[1]);
                let zhuangCount = 0;
                for (let j = 0; j < zhuangCards.length; j++) {
                    zhuangCount += zhuangCards[j].GetCardCount();
                }
                zhuangCount = zhuangCount % 10;
                this._viewUI.clip_zhuang.index = zhuangCount;
                this._viewUI.box_zhuang.visible = true;
            }
        }

        private onUpdateResult(): void {
            if (this._curStatus < MAP_STATUS.PLAY_STATUS_ADD_CARD) return;
            if (this._cardsArr && !this._cardsArr.length) return;
            let xianCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[0]);
            let zhuangCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[1]);
            let xianCount = 0;
            let zhuangCount = 0;
            for (let i = 0; i < xianCards.length; i++) {
                xianCount += xianCards[i].GetCardCount();
            }
            for (let j = 0; j < zhuangCards.length; j++) {
                zhuangCount += zhuangCards[j].GetCardCount();
            }
            xianCount = xianCount % 10;
            zhuangCount = zhuangCount % 10;
            let timeSpace = 0;
            if (!this._baijialeMgr.isReConnect) {
                this._game.playSound(StringU.substitute(Path_game_baijiale.music_baijiale + "dian{0}.mp3", xianCount), false);
                Laya.timer.once(700, this, () => {
                    this._game.playSound(StringU.substitute(Path_game_baijiale.music_baijiale + "dian{0}.mp3", zhuangCount), false);
                })
                timeSpace = 700;
            }
            let resultArr = [];
            if (xianCount > zhuangCount) {
                Laya.timer.once(timeSpace + 500, this, () => {
                    this._game.playSound(Path_game_baijiale.music_baijiale + "win_xian.mp3", false);
                    this._game.uiRoot.HUD.open(BaijialePageDef.PAGE_BAIJIALE_RESULT, (page) => {
                        page.dataSource = 0;
                    });
                })
                resultArr.push(0)
            } else if (xianCount < zhuangCount) {
                Laya.timer.once(timeSpace + 500, this, () => {
                    this._game.playSound(Path_game_baijiale.music_baijiale + "win_zhuang.mp3", false);
                    this._game.uiRoot.HUD.open(BaijialePageDef.PAGE_BAIJIALE_RESULT, (page) => {
                        page.dataSource = 1;
                    })
                });
                resultArr.push(1)
            } else {
                Laya.timer.once(timeSpace + 500, this, () => {
                    this._game.playSound(Path_game_baijiale.music_baijiale + "he.mp3", false);
                    this._game.uiRoot.HUD.open(BaijialePageDef.PAGE_BAIJIALE_RESULT, (page) => {
                        page.dataSource = 2;
                    });
                })
                resultArr.push(2)
            }
            //闲天王
            if ((xianCards[0].GetCardCount() + xianCards[1].GetCardCount()) % 10 >= 8) {
                resultArr.push(3);
            };
            //闲对子
            if ((xianCards[0].GetCardVal() == xianCards[1].GetCardVal())) {
                resultArr.push(4);
            };
            //庄天王
            if ((zhuangCards[0].GetCardCount() + zhuangCards[1].GetCardCount()) % 10 >= 8) {
                resultArr.push(5);
            };
            //庄对子
            if (zhuangCards[0].GetCardVal() == zhuangCards[1].GetCardVal()) {
                resultArr.push(6);
            };

            for (let i = 0; i < resultArr.length; i++) {
                Laya.timer.once(600, this, () => {
                    this.kuangShanShuo(resultArr[i])
                });
            }
        }

        private kuangShanShuo(index): void {
            this._areaKuangUIList[index].visible = true;
            this._areaKuangUIList[index].ani1.play(0, true);
            Laya.timer.once(3000, this, () => {
                this._areaKuangUIList[index].ani1.stop();
                this._areaKuangUIList[index].visible = false;
            });
        }

        private onUpdateMapInfo(): void {
            let mapinfo = this._game.sceneObjectMgr.mapInfo;
            this._baijialeMapInfo = mapinfo as BaijialeMapInfo;
            if (mapinfo) {
                this.initRoomConfig();//地图传送参数
                this.onUpdateCountDown();
                this.onUpdateStatus();
                this.onUpdateBattle();
                this.onUpdateCardPool();
                this.onUpdateTurn();
                this.onUpdateRecord(1);
                this.updateOnline();
                this.onUpdateChipGrey();
                this.onUpdateCardType();
                this.onUpdateGameNo();
                if (!this._baijialeMgr.isReConnect) {
                    this._viewUI.paixieRight.ani2.gotoAndStop(0);
                }
            }
        }

        private onUpdateChipGrey() {
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let money: number = this._game.sceneObjectMgr.mainUnit.GetMoney();
            for (let i = 0; i < this._chipUIList.length; i++) {
                let index = this._chipUIList.length - 1 - i;
                if (money < this._chipArr[index]) {
                    this._chipUIList[index].disabled = true;
                    this._chipUIList[index].y = this._curChipY;
                    this._chipGuangUIList[index].visible = false;
                } else {
                    this._chipUIList[index].disabled = false;
                }
            }
        }

        private onUpdateUnitOffline() {
            let mainPlayer = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let mainPlayerInfo = mainPlayer.playerInfo;
            this._viewUI.main_player.txt_name.text = getMainPlayerName(mainPlayerInfo.nickname);
            this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainPlayer.playerInfo.headimg, 2);
            this._viewUI.main_player.img_qifu.visible = TongyongUtil.getIsHaveQiFu(mainPlayer, this._game.sync.serverTimeBys);
            this._viewUI.main_player.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainPlayer.playerInfo.headKuang, 2);
            let money = EnumToString.getPointBackNum(mainPlayerInfo.money, 2);
            this._viewUI.main_player.txt_money.text = money.toString();
        }

        private onUpdateUnit(qifu_index?: number) {
            let mapinfo: BaijialeMapInfo = this._game.sceneObjectMgr.mapInfo as BaijialeMapInfo;
            if (!mapinfo) return;
            //主玩家的座位
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                this._viewUI.main_player.txt_name.text = getMainPlayerName(mainUnit.GetName());
                let money = EnumToString.getPointBackNum(mainUnit.GetMoney(), 2);
                this._viewUI.main_player.txt_money.text = money.toString();
                let mainIdx = mainUnit.GetIndex();
                this._viewUI.main_player.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainUnit.GetHeadKuangImg(), 2);
                //祈福成功 头像上就有动画
                if (qifu_index && mainIdx == qifu_index) {
                    this._viewUI.main_player.qifu_type.visible = true;
                    this._viewUI.main_player.qifu_type.skin = this._qifuTypeImgUrl;
                    this.playTween(this._viewUI.main_player.qifu_type, qifu_index);
                }
                //时间戳变化 才加上祈福标志
                if (TongyongUtil.getIsHaveQiFu(mainUnit, this._game.sync.serverTimeBys)) {
                    if (qifu_index && mainIdx == qifu_index) {
                        Laya.timer.once(2500, this, () => {
                            this._viewUI.main_player.img_qifu.visible = true;
                            this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                        })
                    } else {
                        this._viewUI.main_player.img_qifu.visible = true;
                        this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                    }
                } else {
                    this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                    this._viewUI.main_player.img_qifu.visible = false;
                }
            }
            this.onUpdateChipGrey();
            this.onUpdateSeatedList(qifu_index);
        }

        private _diff: number = 500;
        private _timeList: { [key: number]: number } = {};
        private _firstList: { [key: number]: number } = {};
        private playTween(img: LImage, index, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList[index]) {
                this._timeList[index] = 0;
            }
            if (this._timeList[index] >= 2500) {
                this._timeList[index] = 0;
                this._firstList[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween, [img, index, !isTween]), this._firstList[index] ? this._diff : 0);
            this._timeList[index] += this._diff;
            this._firstList[index] = 1;
        }
        private _timeList1: { [key: number]: number } = {};
        private _firstList1: { [key: number]: number } = {};
        private playTween1(img: LImage, index, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList1[index]) {
                this._timeList1[index] = 0;
            }
            if (this._timeList1[index] >= 2500) {
                this._timeList1[index] = 0;
                this._firstList1[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween1, [img, index, !isTween]), this._firstList1[index] ? this._diff : 0);
            this._timeList1[index] += this._diff;
            this._firstList1[index] = 1;
        }

        private _qifuTypeImgUrl: string;
        private qifuFly(dataSource: any): void {
            if (!dataSource) return;
            let dataInfo = dataSource;
            this._game.qifuMgr.showFlayAni(this._viewUI.main_player, this._viewUI, dataSource, (dataInfo) => {
                //相对应的玩家精灵做出反应
                this._qifuTypeImgUrl = TongyongUtil.getQFTypeImg(dataInfo.qf_id);
                this.onUpdateUnit(dataInfo.qifu_index);
            });
        }

        private updateOnline(): void {
            if (!this._robotConfig) return;
            let onlineNum = 0;
            for (let key in this._game.sceneObjectMgr.unitDic) {
                if (this._game.sceneObjectMgr.unitDic.hasOwnProperty(key)) {
                    let unit = this._game.sceneObjectMgr.unitDic[key];
                    if (unit) {
                        onlineNum++;
                    }
                }
            }
            let curHour = Sync.getHours(this._game.sync.serverTimeBys * 1000);//当前几点钟
            let index = curHour >= 1 && curHour < 7 ? 0 : curHour >= 7 && curHour < 13 ? 1 : curHour >= 13 && curHour < 19 ? 2 : 3;
            let innerHtml = StringU.substitute("在线<span style='color:#18ff00'>{0}</span>人", onlineNum + this._robotConfig[index]);
            this._htmlText.innerHTML = innerHtml;
        }

        private updateMoney(): void {
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                let money = EnumToString.getPointBackNum(mainUnit.GetMoney(), 2);
                this._viewUI.main_player.txt_money.text = money.toString();
            }
        }

        //战斗结构体更新
        private _battleIndex: number = -1;
        private _askTimes = 0;
        private onUpdateBattle() {
            if (!this._baijialeMapInfo) return;
            let battleInfoMgr = this._baijialeMapInfo.battleInfoMgr;
            if (!battleInfoMgr) return;
            for (let i = 0; i < battleInfoMgr.info.length; i++) {
                let info = battleInfoMgr.info[i];
                if (info instanceof gamecomponent.object.BattleInfoDeal) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        let index = info.SeatIndex - 1;
                        let cards = info.Cards;
                        if (!this._cardsArr) this._cardsArr = [];
                        this._cardsArr[info.SeatIndex - 1] = cards;
                        if (!this._baijialeMgr.isReConnect && this._curStatus == MAP_STATUS.PLAY_STATUS_SHOW_CARD) {
                            Laya.timer.once(1700 + 1800 * index, this, () => {
                                this._aniKaiList[index].visible = true;
                                this._aniKaiList[index].ani_kaipai.play(0, false);
                                this._aniKaiList[index].card.skin = StringU.substitute(PathGameTongyong.ui_tongyong_pai + "{0}.png", cards[1]);
                                this._baijialeMgr.yincang(index, 0);
                            })
                        }
                    }
                }
                if (info instanceof gamecomponent.object.BattleInfoAreaBet) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleBet(info, i);
                    }
                }
                if (info instanceof gamecomponent.object.BattleInfoSettle) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleSettle(info);
                    }
                }
                if (info instanceof gamecomponent.object.BattleInfoAsk) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        let cardVal = info.Card;
                        let timeCount = info.SeatIndex;
                        this._askTimes++;
                        if (this._addCardType == 1 || this._addCardType == 2) {
                            timeCount = 1;
                        }
                        this._cardsArr[info.SeatIndex - 1].push(cardVal);
                        if (!this._baijialeMgr.isReConnect && this._curStatus == MAP_STATUS.PLAY_STATUS_ADD_CARD) {
                            Laya.timer.once(350 + 2500 * (timeCount - 1), this, () => {
                                this._viewUI.paixieRight.ani2.play(0, false);
                            })
                            Laya.timer.once(800 + 2500 * (timeCount - 1), this, () => {
                                this._aniKaiList[info.SeatIndex + 1].card.skin = StringU.substitute(PathGameTongyong.ui_tongyong_pai + "{0}.png", cardVal);
                                this._aniKaiList[info.SeatIndex + 1].visible = true;
                                this._aniKaiList[info.SeatIndex + 1].ani_kaipai.play(0, false);
                                if (info.SeatIndex == 2) {
                                    if (this._baijialeMgr.allCards.length == 5) {
                                        this._baijialeMgr.yincang(info.SeatIndex - 2, 1);
                                    } else {
                                        this._baijialeMgr.yincang(info.SeatIndex - 1, 1);
                                    }
                                } else {
                                    this._baijialeMgr.yincang(info.SeatIndex - 1, 1);
                                }
                            });
                        }
                    }
                }
                if (info instanceof gamecomponent.object.BattleLogCardsResult) {
                    if (this._battleIndex < i) {
                        if (!this._game.sceneObjectMgr.mainUnit) return;
                        this._battleIndex = i;
                        this.onBattleResult(info);
                    }
                }
            }
        }
        //战斗日志来更新桌面上的筹码
        private onBattleBet(info: any, index: number): void {
            //主玩家的座位
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let mainIdx = this._game.sceneObjectMgr.mainUnit.GetIndex();
            let startIdx: number;
            let targetIdx: number;
            let isMainPlayer: boolean = info.SeatIndex == mainIdx;
            if (isMainPlayer) {//主玩家
                startIdx = 0;
                this.moveHead(this._viewUI.main_player, this._mainHeadPos[0][0], this._mainHeadPos[0][1], this._mainHeadPos[1][0], this._mainHeadPos[1][1]);
            } else {//其他玩家
                startIdx = 1;
                for (let i = 0; i < this._unitSeated.length; i++) {
                    let unitIndex = this._unitSeated[i][0];
                    let unit = this._game.sceneObjectMgr.getUnitByIdx(unitIndex);
                    if (unit && info.SeatIndex == unitIndex) {
                        this.moveHead(this._seatUIList[i], this._headStartPos[i][0], this._headStartPos[i][1], this._headEndPos[i][0], this._headEndPos[i][1]);
                        startIdx = 3 + i;
                    }
                }
                if (startIdx == 1) {
                    this.moveHead(this._viewUI.btn_playerList, 70, 657, 80, 647);
                }
            }
            targetIdx = info.BetIndex;
            let type = this._chipArr.indexOf(info.BetVal) + 1;
            this.createChip(startIdx, targetIdx, type, info.BetVal, index, info.SeatIndex);
            this.updateChipOnTable(targetIdx - 1, info.BetVal, isMainPlayer);
        }

        //头像出筹码动态效果
        private moveHead(view, startX, startY, endX, endY): void {
            Laya.Tween.clearAll(view);
            Laya.Tween.to(view, { x: endX, y: endY }, 150, null, Handler.create(this, () => {
                Laya.Tween.to(view, { x: startX, y: startY }, 150);
            }))
        }

        private updateChipOnTable(index: number, bet: number, isMainPlayer: boolean) {
            if (isMainPlayer) {
                this._betMainList[index] += bet;
                this._betMainTotal += bet;
            }
            this._betTotalList[index] += bet;

            this.updateBetNum();
        }

        private updateBetNum(): void {
            for (let i = 0; i < 7; i++) {
                if (i < 2) {
                    this._htmlTextArr[i].innerHTML = StringU.substitute("<span style='color:#ffd200'>{0}</span><span style='color:#ffffff'>/{1}</span>", this._betMainList[i], this._betTotalList[i]);
                } else {
                    this._txtTotalUIList[i].text = this._betTotalList[i];
                }
                if (i > 1) {
                    this._txtBetUIList[i - 2].text = this._betMainList[i];
                }
            }
        }

        //创建筹码
        private createChip(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
            let chip = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CHIP_MARK, BaijialeChip) as BaijialeChip;
            chip.setData(startIdx, targetIdx, type, value, index, unitIndex);
            this._chipTotalList[targetIdx - 1].push(chip);
            if (this._baijialeMgr.isReConnect && this._curStatus != MAP_STATUS.PLAY_STATUS_BET) {
                chip.drawChip();
            }
            else {
                Laya.timer.once(350, this, () => {
                    chip.sendChip();
                    this._game.playSound(Path_game_baijiale.music_baijiale + "chouma.mp3", false);
                })
            }
            this._chipSortScore = index;//存下来最后一个筹码层级
        }

        //庄家飞筹码去输的区域
        private bankerFlyChip(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
            let chip = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CHIP_MARK, BaijialeChip) as BaijialeChip;
            chip.setData(startIdx, targetIdx, type, value, index, unitIndex);
            this._chipTotalList[targetIdx - 1].push(chip);
            Laya.timer.once(350, this, () => {
                chip.sendChip();
            })
        }

        private onBattleSettle(info: any): void {
            if (!this._game.sceneObjectMgr.mainUnit) return;
            if (this._game.sceneObjectMgr.mainUnit.GetIndex() == info.SeatIndex) {
                this._mainPlayerBenefit = parseFloat(info.SettleVal);
            }
            if (info.SettleVal == 0) return;
            this.addMoneyClip(info.SeatIndex, info.SettleVal);
        }

        private areaName = ["闲", "庄", "和", "闲天王", "闲对子", "庄天王", "庄对子"];
        private onBattleResult(info: any): void {
            for (let i = 0; i < info.Results.length; i++) {
                if (!this._lottery)
                    this._lottery = this.areaName[info.Results[i] - 1];
                else
                    this._lottery += " , " + this.areaName[info.Results[i] - 1];
            }
        }

        //结算飘筹码
        private flyChipEffect(): void {
            if (!this._cardsArr) return;
            if (!this._cardsArr.length) return;
            let resultList: Array<number> = [0, 0, 0, 0, 0, 0, 0];
            let xianCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[0]);
            let zhuangCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[1]);
            let xianCount = 0;
            let zhuangCount = 0;
            let isHeJu = false;
            for (let i = 0; i < xianCards.length; i++) {
                xianCount += xianCards[i].GetCardCount();
            }
            for (let j = 0; j < zhuangCards.length; j++) {
                zhuangCount += zhuangCards[j].GetCardCount();
            }
            xianCount = xianCount % 10;
            zhuangCount = zhuangCount % 10;
            if (xianCount > zhuangCount) {
                resultList[1] = 1;
                resultList[2] = 1;
                if (this._betTotalList[0] <= 0)
                    resultList[0] = 1;
            } else if (xianCount < zhuangCount) {
                resultList[0] = 1;
                resultList[2] = 1;
                if (this._betTotalList[1] <= 0)
                    resultList[1] = 1;
            } else {//和局退还闲家和庄家的筹码
                isHeJu = true;
                if (this._betTotalList[2] <= 0)
                    resultList[2] = 1;
            }
            //闲天王
            resultList[3] = (xianCards[0].GetCardCount() + xianCards[1].GetCardCount()) % 10 >= 8 && this._betTotalList[3] > 0 ? 0 : 1;
            //闲对子
            resultList[4] = (xianCards[0].GetCardVal() == xianCards[1].GetCardVal()) && this._betTotalList[4] > 0 ? 0 : 1;
            //庄天王
            resultList[5] = (zhuangCards[0].GetCardCount() + zhuangCards[1].GetCardCount()) % 10 >= 8 && this._betTotalList[5] > 0 ? 0 : 1;
            //庄对子
            resultList[6] = (zhuangCards[0].GetCardVal() == zhuangCards[1].GetCardVal()) && this._betTotalList[6] > 0 ? 0 : 1;

            for (let i = 0; i < this._chipTotalList.length; i++) {
                let chipArr = [];
                chipArr = this._chipTotalList[i];
                if (resultList[i] == 1) {
                    this._game.playSound(Path_game_baijiale.music_baijiale + "piaoqian.mp3", false);
                    for (let j = 0; j < chipArr.length; j++) {
                        let chip: BaijialeChip = chipArr[j];
                        chip.flyChip(2, false, j, this._game);//庄家先收筹码
                    }
                } else {
                    if (!(isHeJu && i < 2)) {
                        Laya.timer.once(800, this, () => {
                            this._game.playSound(Path_game_baijiale.music_baijiale + "piaoqian.mp3", false);
                            for (let j = 0; j < 20; j++) {
                                let ranType = MathU.randomRange(1, 5);
                                let ranVal = this._chipArr[ranType - 1];
                                this._chipSortScore++;
                                this.bankerFlyChip(2, i + 1, ranType, ranVal, this._chipSortScore, -1);
                            }
                        })
                    }
                    Laya.timer.once(2000, this, () => {
                        this._game.playSound(Path_game_baijiale.music_baijiale + "piaoqian.mp3", false);
                        for (let j = 0; j < chipArr.length; j++) {
                            let chip: BaijialeChip = chipArr[j];
                            let mainIndex = this._game.sceneObjectMgr.mainUnit.GetIndex();
                            if (chip._seatIndex == mainIndex) {
                                chip.flyChip(0, false, j, this._game);//主玩家收筹码
                            } else {
                                let isSeat: boolean = false;
                                for (let k = 0; k < this._unitSeated.length; k++) {
                                    let seatInfo = this._unitSeated[k];
                                    if (seatInfo && seatInfo[0] == chip._seatIndex) {
                                        chip.flyChip(3 + k, false, j, this._game);//入座玩家收筹码
                                        isSeat = true;
                                        break;
                                    }
                                }
                                if (!isSeat) {
                                    chip.flyChip(1, false, j, this._game);//其他玩家收筹码
                                }
                            }
                        }

                    })
                }

            }
        }

        //金币变化 飘字clip
        public addMoneyClip(index: number, value: number): void {
            let valueClip = value >= 0 ? new BaijialeClip(BaijialeClip.ADD_MONEY_FONT) : new BaijialeClip(BaijialeClip.SUB_MONEY_FONT);
            let preSkin = value >= 0 ? PathGameTongyong.ui_tongyong_general + "tu_jia.png" : PathGameTongyong.ui_tongyong_general + "tu_jian.png";
            valueClip.scale(0.8, 0.8);
            valueClip.anchorX = 0.5;
            valueClip.setText(Math.abs(value), true, false, preSkin);
            let playerIcon: any;
            if (index == this._game.sceneObjectMgr.mainUnit.GetIndex()) {
                playerIcon = this._viewUI.main_player;
            } else {
                let unit = this._game.sceneObjectMgr.getUnitByIdx(index);
                if (!unit) return;
                let seatIndex = unit.GetSeat();
                let bool = false;
                for (let i = 0; i < this._unitSeated.length; i++) {
                    let unitIndex = this._unitSeated[i][0];
                    if (index == unitIndex) {
                        bool = true;
                    }
                }
                if (!seatIndex) return;
                if (!bool) return;
                playerIcon = this._seatUIList[seatIndex - 1];
            }
            valueClip.x = playerIcon.clip_money.x;
            valueClip.y = playerIcon.clip_money.y;
            playerIcon.clip_money.parent.addChild(valueClip);
            this._clipList.push(valueClip);
            playerIcon.clip_money.visible = false;
            Laya.Tween.clearAll(valueClip);
            Laya.Tween.to(valueClip, { y: valueClip.y - 25 }, 1500);
        }

        //清理飘字clip
        private clearClips(): void {
            if (this._clipList && this._clipList.length) {
                for (let i: number = 0; i < this._clipList.length; i++) {
                    let clip = this._clipList[i];
                    clip.removeSelf();
                    clip.destroy(true);
                    clip = null;
                }
            }
            this._clipList = [];
        }

        //更新地图状态
        private onUpdateStatus() {
            if (!this._baijialeMapInfo) return;
            this.initRoomConfig();
            let mapStatus = this._baijialeMapInfo.GetMapState();
            if (this._curStatus == mapStatus) return;
            this._curStatus = mapStatus;
            this._viewUI.btn_repeat.disabled = this._curStatus != MAP_STATUS.PLAY_STATUS_BET;

            switch (this._curStatus) {
                case MAP_STATUS.PLAY_STATUS_NONE:// 准备阶段
                    this._viewUI.txt_status.index = 1;
                    this.resetAll();
                    break;
                case MAP_STATUS.PLAY_STATUS_GAMESTART:// 游戏开始
                    this.resetAll();
                    this._viewUI.txt_status.index = 0;
                    if (this._baijialeMapInfo.GetRound() == 1) {
                        this._viewUI.xipai.x = 640;
                        this._viewUI.xipai.y = 310;
                        this._viewUI.xipai.scaleX = 1;
                        this._viewUI.xipai.scaleY = 1;
                        this._viewUI.xipai.alpha = 1;
                        this._viewUI.xipai.rotation = 0;
                        this._viewUI.xipai.visible = true;
                        this._viewUI.xipai.ani_xipai.play(0, false);
                        Laya.timer.once(800, this, () => {
                            Laya.Tween.clearAll(this._viewUI.xipai);
                            Laya.Tween.to(this._viewUI.xipai, { x: 922, y: 144, alpha: 0, rotation: -30, scaleX: 0.35, scaleY: 0.35 }, 500);
                        })
                        Laya.timer.once(1300, this, () => {
                            this._viewUI.paixieRight.cards.visible = true;
                            this._viewUI.paixieRight.ani_chupai.play(0, false);
                        })
                    }
                    break;
                case MAP_STATUS.PLAY_STATUS_PUSH_CARD:// 发牌阶段
                    this._viewUI.txt_status.index = 4;
                    this._viewUI.paixieRight.ani2.play(0, true);
                    break;
                case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
                    if (this._baijialeMgr.isReConnect && Math.floor(this._baijialeMapInfo.GetCountDown() - this._game.sync.serverTimeBys) < 13) {
                        this.onUpdateSeatedList();
                        this._viewUI.txt_status.index = 3;
                        let bool = false;
                        for (let i = 0; i < this._rebetList.length; i++) {
                            if (this._rebetList[i] > 0) {
                                bool = true;
                                break;
                            }
                        }
                        this._viewUI.btn_repeat.disabled = !bool;

                        for (let i = 0; i < this._areaKuangUIList.length; i++) {
                            this._areaKuangUIList[i].visible = true;
                            this._areaKuangUIList[i].ani1.play(0, true);
                            Laya.timer.once(1000, this, () => {
                                this._areaKuangUIList[i].ani1.stop();
                                this._areaKuangUIList[i].visible = false;
                            });
                        }
                        this._baijialeMgr.isReConnect = false;
                    } else {
                        this._pageHandle.pushOpen({ id: BaijialePageDef.PAGE_BAIJIALE_BEGIN, parent: this._game.uiRoot.HUD });
                        this._game.playSound(Path_game_baijiale.music_baijiale + "dingding_start.mp3");
                        this._game.playSound(Path_game_baijiale.music_baijiale + "xiazhu_start.mp3");
                        this.onUpdateSeatedList();
                        this._viewUI.txt_status.index = 3;
                        let bool = false;
                        for (let i = 0; i < this._rebetList.length; i++) {
                            if (this._rebetList[i] > 0) {
                                bool = true;
                                break;
                            }
                        }
                        this._viewUI.btn_repeat.disabled = !bool;

                        for (let i = 0; i < this._areaKuangUIList.length; i++) {
                            this._areaKuangUIList[i].visible = true;
                            this._areaKuangUIList[i].ani1.play(0, true);
                            Laya.timer.once(1000, this, () => {
                                this._areaKuangUIList[i].ani1.stop();
                                this._areaKuangUIList[i].visible = false;
                            });
                        }
                    }
                    break;
                case MAP_STATUS.PLAY_STATUS_SHOW_CARD:// 开牌阶段
                    if (!(this._baijialeMgr.isReConnect && Math.floor(this._baijialeMapInfo.GetCountDown() - this._game.sync.serverTimeBys) < 2)) {
                        this._pageHandle.pushOpen({ id: BaijialePageDef.PAGE_BAIJIALE_END, parent: this._game.uiRoot.HUD });
                        this._game.playSound(Path_game_baijiale.music_baijiale + "dingding_end.mp3");
                        this._game.playSound(Path_game_baijiale.music_baijiale + "xiazhu_end.mp3");
                    }
                    this._pageHandle.pushClose({ id: BaijialePageDef.PAGE_BAIJIALE_BEGIN, parent: this._game.uiRoot.HUD });
                    let betAllTotal = 0;
                    for (let i = 0; i < this._betMainList.length; i++) {
                        betAllTotal += this._betMainList[i];
                    }
                    if (betAllTotal > 0) {
                        for (let i = 0; i < this._betMainList.length; i++) {
                            this._rebetList[i] = this._betMainList[i];
                        }
                    }
                    this._viewUI.txt_status.index = 5;
                    break;
                case MAP_STATUS.PLAY_STATUS_ADD_CARD:// 补牌阶段
                    this._pageHandle.pushClose({ id: BaijialePageDef.PAGE_BAIJIALE_END, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.index = 5;
                    break;
                case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段
                    this.onUpdateCount(0);//强校验闲家点数，防止点数没有更新
                    this.onUpdateCount(1);//强校验庄家点数，防止点数没有更新
                    this.onUpdateSeatedList();
                    this._viewUI.txt_status.index = 6;
                    if (!this._baijialeMgr.isReConnect) {
                        this.flyChipEffect();
                    }
                    this.onUpdateResult();
                    break;
                case MAP_STATUS.PLAY_STATUS_SHOW_INFO:// 显示结算信息阶段
                    this._pageHandle.pushClose({ id: BaijialePageDef.PAGE_BAIJIALE_RESULT, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.index = 6;
                    this.showSettleInfo();
                    Laya.timer.once(1000, this, () => {
                        if (this._mainPlayerBenefit >= 0) {
                            let rand = MathU.randomRange(1, 3);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "win{0}.mp3", rand), true);
                        } else if (this._mainPlayerBenefit < 0) {
                            let rand = MathU.randomRange(1, 4);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "lose{0}.mp3", rand), true);
                        }
                    });
                    break;
                case MAP_STATUS.PLAY_STATUS_RELAX:// 休息阶段
                    this._pageHandle.pushClose({ id: TongyongPageDef.PAGE_TONGYONG_SETTLE, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.index = 1;
                    this.resetAll();
                    this.onUpdateCardPool(1);
                    break;

            }

            this._pageHandle.updatePageHandle();//更新额外界面的开关状态
            this._pageHandle.reset();//清空额外界面存储数组
        }

        //按钮缓动回调
        protected onBtnTweenEnd(e: any, target: any): void {
            switch (target) {
                case this._viewUI.btn_spread:
                    this.showMenu(true);
                    break;
                case this._viewUI.btn_playerList://玩家列表
                    this._game.uiRoot.general.open(BaijialePageDef.PAGE_BAIJIALE_PLAYER_LIST);
                    break;
                case this._viewUI.btn_road://大路详情
                    this._game.uiRoot.general.open(BaijialePageDef.PAGE_BAIJIALE_ROAD);
                    break;
                case this._viewUI.btn_qifu://祈福
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_QIFU);
                    break;
                case this._viewUI.btn_rule://规则
                    this._game.uiRoot.general.open(BaijialePageDef.PAGE_BAIJIALE_RULE);
                    break;
                case this._viewUI.btn_set://设置
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_SETTING)
                    break;
                case this._viewUI.btn_zhanji://战绩
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_RECORD, (page) => {
                        page.dataSource = BaijialePageDef.GAME_NAME;
                    });
                    break;
                case this._viewUI.btn_chongzhi://充值
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                    break;
                case this._viewUI.btn_repeat://重新下注
                    this.repeatBet();
                    break;
                case this._viewUI.btn_back://返回
                    let totalBet = 0;
                    for (let i = 0; i < this._betMainList.length; i++) {
                        totalBet += this._betMainList[i];
                    }
                    if (totalBet && this._baijialeMapInfo && this._baijialeMapInfo.GetPlayState() == 1) {
                        this._game.showTips("游戏尚未结束，请先打完这局哦~");
                        return;
                    }
                    TongyongPageDef.ins.alertClose("baijiale", this, this.onClickCancle);
                    break;
                default:
                    break;
            }
        }

        //确定退出回调
        private onClickCancle(): void {
            this._game.sceneObjectMgr.leaveStory(true);
        }

        //重复下注
        private repeatBet(): void {
            if (this.showIsGuest()) return;
            if (this._betWait) return;//投注间隔
            let betArr = [];
            let total = 0;
            for (let i = 0; i < this._rebetList.length; i++) {
                if (this._rebetList[i] + this._betMainList[i] > this._betlimit) {
                    this._game.uiRoot.topUnder.showTips(StringU.substitute("投注点限红{0}哦~", this._betlimit));
                    return;
                }
            }
            for (let i = 0; i < this._rebetList.length; i++) {
                if (this._betMainList[0] > 0) {//闲
                    if (this._rebetList[1] > 0) {
                        this._game.uiRoot.topUnder.showTips("老板，庄闲不能同时下注哦~");
                        return;
                    }
                }
                if (this._betMainList[1] > 0) {//庄
                    if (this._rebetList[0] > 0) {
                        this._game.uiRoot.topUnder.showTips("老板，庄闲不能同时下注哦~");
                        return;
                    }
                }
                total += this._rebetList[i];
            }
            if (total > this._game.sceneObjectMgr.mainUnit.GetMoney()) {
                this._game.uiRoot.topUnder.showTips("老板,您的金币不够重复下注啦~");
                return;
            }
            for (let i = 0; i < this._rebetList.length; i++) {
                let antes = this._rebetList[i]//之前区域i下注总额
                if (antes) {
                    //从最大筹码开始循环，优先丢出大额筹码，剩下零头再由小额筹码去拼凑
                    for (let j = this._chipArr.length - 1; j >= 0; j--) {
                        if (!antes) break;
                        let num = Math.floor(antes / this._chipArr[j]);
                        if (num) {
                            antes = antes - this._chipArr[j] * num;
                            for (let k = 0; k < num; k++) {
                                this._game.network.call_baijiale_bet(this._chipArr[j], i + 1);
                            }
                        }
                    }
                }
            }
            this._betWait = true;
            Laya.timer.once(500, this, () => {
                this._betWait = false;
            })
        }

        //天地玄黄下注
        private _betWait: boolean = false;
        private onAreaBetClick(index: number, e: LEvent): void {
            if (this.showIsGuest()) return;
            if (this._curStatus != MAP_STATUS.PLAY_STATUS_BET) {
                this._game.uiRoot.topUnder.showTips("当前不在下注时间，请在下注时间再进行下注！");
                return;
            }
            if (this._betWait) return;//投注间隔
            let total = this._betMainList[index];
            if (this._curChip + total > this._betlimit) {
                this._game.uiRoot.topUnder.showTips(StringU.substitute("本投注点限红{0}哦~", this._betlimit));
                return;
            }
            if (index == 0) {//闲
                if (this._betMainList[1] > 0) {
                    this._game.uiRoot.topUnder.showTips("老板，庄闲不能同时下注哦~");
                    return;
                }
            }
            if (index == 1) {//庄
                if (this._betMainList[0] > 0) {
                    this._game.uiRoot.topUnder.showTips("老板，庄闲不能同时下注哦~");
                    return;
                }
            }
            let money = this._game.sceneObjectMgr.mainUnit.GetMoney();
            let betBefore = 0;
            for (let i = 0; i < 7; i++) {
                betBefore += this._betMainList[i];
            }
            if (money + betBefore < PLAYER_LEAST_MONEY) {
                TongyongPageDef.ins.alertRecharge(StringU.substitute("老板，您的金币少于{0}哦~\n补充点金币去大杀四方吧~", PLAYER_LEAST_MONEY), () => {
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                }, () => {
                }, true, TongyongPageDef.TIPS_SKIN_STR['cz']);
                return;
            }
            if (!this._curChip || this._curChip > money) {
                TongyongPageDef.ins.alertRecharge("老板，您的金币不足哦~\n补充点金币去大杀四方吧~", () => {
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                }, () => {
                }, true, TongyongPageDef.TIPS_SKIN_STR['cz']);
                return;
            }

            this._betWait = true;
            Laya.timer.once(500, this, () => {
                this._betWait = false;
            })
            this._rebetList[index] += this._curChip;
            this._game.network.call_baijiale_bet(this._curChip, index + 1)
        }

        //筹码点击事件
        private onClickChip(index: number, e: LEvent): void {
            if (this._chipArr[index] == this._curChip) return;
            this._game.uiRoot.btnTween(e.currentTarget);
            this.onSelectChip(index);
        }

        //选择筹码
        private onSelectChip(index: number): void {
            this._curChip = this._chipArr[index];
            for (let i: number = 0; i < this._chipUIList.length; i++) {
                this._chipGuangUIList[i].visible = i == index;
                this._chipUIList[i].y = i == index ? this._curChipY - 10 : this._curChipY;
            }
        }

        //选择座位入座
        private onSelectSeat(index: number): void {
            if (this.showIsGuest()) return;
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (!mainUnit) return;
            if (mainUnit.GetMoney() < this._seatlimit) {
                this._game.uiRoot.topUnder.showTips("金币不足");
                return;
            }
            this._game.network.call_baijiale_seated(index + 1);
        }

        private onSeeCardOver(index: number): void {
            if (this._curStatus >= MAP_STATUS.PLAY_STATUS_SHOW_CARD && this._curStatus < MAP_STATUS.PLAY_STATUS_RELAX) {
                this._aniKaiList[index].ani_kaipai.stop();
                this._aniKaiList[index].visible = false;
                if (index == 0 || index == 2) {
                    this.onUpdateCount(0);
                }
                if (index == 1 || index == 3) {
                    this.onUpdateCount(1);
                }
                if (this._addCardType == 0) {//闲庄都不补牌
                    if (index == 1)
                        this._baijialeMgr.event(BaijialeMgr.SHOW_OVER);
                } else if (this._addCardType == 1) {//闲补庄不补
                    if (index == 2) {
                        this._baijialeMgr.kaipai(0);
                        this._baijialeMgr.event(BaijialeMgr.SHOW_OVER);
                    }
                } else if (this._addCardType == 2) {//庄补闲不补
                    if (index == 3) {
                        this._baijialeMgr.kaipai(0);
                        this._baijialeMgr.event(BaijialeMgr.SHOW_OVER);
                    }
                } else if (this._addCardType == 3) {//闲庄都补牌
                    this._baijialeMgr.kaipai(index - 2);
                    if (index == 3)
                        this._baijialeMgr.event(BaijialeMgr.SHOW_OVER);
                }
            }
        }

        protected onMouseClick(e: LEvent) {
            if (e.target != this._viewUI.btn_spread) {
                this.showMenu(false);
            }
        }

        showMenu(isShow: boolean) {
            if (isShow) {
                this._viewUI.box_menu.visible = true;
                this._viewUI.btn_spread.visible = false;
                this._viewUI.box_menu.y = -this._viewUI.box_menu.height;
                Laya.Tween.clearAll(this._viewUI.box_menu);
                Laya.Tween.to(this._viewUI.box_menu, { y: 10 }, 300, Laya.Ease.circIn)
            } else {
                if (this._viewUI.box_menu.y >= 0) {
                    Laya.Tween.clearAll(this._viewUI.box_menu);
                    Laya.Tween.to(this._viewUI.box_menu, { y: -this._viewUI.box_menu.height }, 300, Laya.Ease.circIn, Handler.create(this, () => {
                        this._viewUI.btn_spread.visible = true;
                        this._viewUI.box_menu.visible = false;
                    }));
                }
            }
        }

        //显示结算界面
        private showSettleInfo(): void {
            if (this._cardsArr && !this._cardsArr.length) return;
            let resultList: Array<number> = [0, 0, 0, 0, 0, 0, 0];
            let xianCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[0]);
            let zhuangCards: Array<BaijialeData> = this._baijialeMgr.initCards(this._cardsArr[1]);
            let xianCount = 0;
            let zhuangCount = 0;
            let isHeJu = false;
            for (let i = 0; i < xianCards.length; i++) {
                xianCount += xianCards[i].GetCardCount();
            }
            for (let j = 0; j < zhuangCards.length; j++) {
                zhuangCount += zhuangCards[j].GetCardCount();
            }
            xianCount = xianCount % 10;
            zhuangCount = zhuangCount % 10;
            if (xianCount > zhuangCount) {
                resultList[1] = 1;
                resultList[2] = 1;
            } else if (xianCount < zhuangCount) {
                resultList[0] = 1;
                resultList[2] = 1;
            } else {//和局退还闲家和庄家的筹码
                isHeJu = true;
                resultList[0] = 2;
                resultList[1] = 2;
            }
            //闲天王
            resultList[3] = (xianCards[0].GetCardCount() + xianCards[1].GetCardCount()) % 10 >= 8 ? 0 : 1;
            //闲对子
            resultList[4] = (xianCards[0].GetCardVal() == xianCards[1].GetCardVal()) ? 0 : 1;
            //庄对子
            resultList[5] = (zhuangCards[0].GetCardVal() == zhuangCards[1].GetCardVal()) ? 0 : 1;
            //庄天王
            resultList[6] = (zhuangCards[0].GetCardCount() + zhuangCards[1].GetCardCount()) % 10 >= 8 ? 0 : 1;
            this._pageHandle.pushOpen({
                id: TongyongPageDef.PAGE_TONGYONG_SETTLE,
                dataSource: { myBet: this._betMainTotal, myBenefit: this._mainPlayerBenefit, lottery: this._lottery },
                parent: this._game.uiRoot.HUD
            });
        }

        private showIsGuest(): boolean {
            if (WebConfig.baseplatform == PageDef.BASE_PLATFORM_TYPE_NQP) return false;
            if (this._game.sceneObjectMgr.mainPlayer.IsIsGuest()) {
                TongyongPageDef.ins.alertRecharge("亲爱的玩家，您正使用游客模式进行游戏，该模式下的游戏数据（包括付费数据）在删除游戏、更换设备后清空！对此造成的损失，本平台将不承担任何责任。为保障您的虚拟财产安全，我们强力建议您绑定手机号升级为正式账号。",
                    () => { }, () => { }, true);
                return true;
            }
            return false;
        }

        private resetAll(): void {
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.clearClips();
            this.resetData();
            this.resetUI();
            if (this._baijialeMgr) this._baijialeMgr.clear();
            Laya.timer.clear(this, this.kuangShanShuo);
        }

        private onUpdateGameNo(): void {
            let gameNo = this._baijialeMapInfo.GetGameNo();
            if (gameNo) {
                this._viewUI.txt_id.visible = true;
                this._viewUI.txt_id.text = "牌局号：" + gameNo;
            }
        }

        private onUpdateCountDown(): void {
            if (!this._baijialeMapInfo) return;
            this._countDown = this._baijialeMapInfo.GetCountDown();
        }

        private onUpdateRecord(val?: number): void {
            if (!this._baijialeMapInfo) return;
            let recordArr = [];
            let newRecordArr = [];
            let gameRecord = this._baijialeMapInfo.GetGameRecord();
            if (gameRecord != "") {
                let data = JSON.parse(gameRecord);
                if (data.length > 18) {
                    for (let i = 0; i < 18; i++) {
                        recordArr[17 - i] = data[data.length - 1 - i];
                        newRecordArr[17 - i] = data[data.length - 1 - i];
                    }
                    if (!val) {
                        newRecordArr[newRecordArr.length - 1] = 99;
                        this._viewUI.list_record.dataSource = newRecordArr;
                        Laya.timer.once(1000, this, () => {
                            this._viewUI.list_record.dataSource = recordArr;
                        })
                    } else {
                        this._viewUI.list_record.dataSource = recordArr;
                    }
                } else {
                    this._viewUI.list_record.dataSource = data;
                }
            } else {//没数据要初始化
                this._viewUI.list_record.dataSource = recordArr;
            }
        }

        private onUpdateSeatedList(qifu_index?: number): void {
            if (!this._baijialeMapInfo) return;
            let gameList = this._baijialeMapInfo.GetSeatedList();
            if (gameList != "") {
                this._unitSeated = JSON.parse(gameList);
            }
            if (!this._unitSeated.length) {
                return;
            }
            for (let i = 0; i < this._seatUIList.length; i++) {
                let unitIndex = this._unitSeated[i][0];
                let unit = this._game.sceneObjectMgr.getUnitByIdx(unitIndex);
                let seat = this._seatUIList[i] as ui.nqp.game_ui.tongyong.TouXiangWzUI;
                if (unit) {
                    seat.img_txk.visible = true;
                    seat.txt_name.text = getMainPlayerName(unit.GetName());
                    seat.txt_money.text = EnumToString.getPointBackNum(unit.GetMoney(), 2).toString();
                    seat.txt_name.fontSize = 15;                    
                    seat.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg(), 2);
                    seat.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(unit.GetHeadKuangImg(), 2);
                    //祈福成功 头像上就有动画
                    if (qifu_index && unitIndex == qifu_index) {
                        seat.qifu_type.visible = true;
                        seat.qifu_type.skin = this._qifuTypeImgUrl;
                        this.playTween1(seat.qifu_type, qifu_index);
                    }
                    //时间戳变化 才加上祈福标志
                    if (TongyongUtil.getIsHaveQiFu(unit, this._game.sync.serverTimeBys)) {
                        if (qifu_index && unitIndex == qifu_index) {
                            Laya.timer.once(2500, this, () => {
                                seat.img_qifu.visible = true;
                                seat.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg(), 2);
                            })
                        } else {
                            seat.img_qifu.visible = true;
                            seat.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg(), 2);
                        }
                    } else {
                        seat.img_qifu.visible = false;
                    }
                } else {
                    seat.txt_name.text = "";
                    seat.txt_money.text = "点击入座";
                    seat.txt_name.fontSize = 20;
                    seat.img_icon.skin = PathGameTongyong.ui_tongyong_general + "tu_weizi.png";
                    seat.img_qifu.visible = false;
                    seat.qifu_type.visible = false;
                    seat.img_txk.visible = false;
                }
            }
        }

        //初始化UI界面
        private initView(): void {
            this._viewUI.box_menu.zOrder = 99;
            this._viewUI.box_menu.visible = false;
            this._areaList = [];
            this._chipUIList = [];
            this._seatUIList = [];
            this._chipGuangUIList = [];
            this._areaKuangUIList = [];
            this._txtTotalUIList = [];
            this._txtBetUIList = [];
            this._htmlTextArr = [];
            this._aniKaiList = [];
            for (let i: number = 0; i < 7; i++) {
                this._areaList.push(this._viewUI["area" + i]);
                this._areaKuangUIList.push(this._viewUI["kuang" + i]);
                this._txtTotalUIList.push(this._viewUI["txt_total" + i]);
                this._areaKuangUIList[i].visible = false;
                this._areaList[i].on(LEvent.CLICK, this, this.onAreaBetClick, [i]);

                if (i < 2) {
                    this._htmlTextArr[i] = TextFieldU.createHtmlText(this._txtTotalUIList[i]);
                    this._htmlTextArr[i].style.lineHeight = 30;
                    this._htmlTextArr[i].style.valign = "middle";
                    this._htmlTextArr[i].innerHTML = "<span style='color:#ffd200'>0</span><span style='color:#ffffff'>/0</span>";
                } else {
                    this._txtTotalUIList[i].text = "0";
                }
            }
            for (let i: number = 0; i < 5; i++) {
                this._txtBetUIList.push(this._viewUI["txt_bet" + (i + 2)]);
                this._txtBetUIList[i].text = "0";
            }
            for (let i: number = 0; i < 5; i++) {
                this._chipUIList.push(this._viewUI["btn_chip" + i]);
                this._chipUIList[i].on(LEvent.CLICK, this, this.onSelectChip, [i]);
                this._chipGuangUIList.push(this._viewUI["guang" + i]);
                if (i == 0) {
                    this._curChipY = this._chipUIList[i].y;
                    this._chipGuangUIList[i].visible = true;
                } else {
                    this._chipGuangUIList[i].visible = false;
                }
            }
            for (let i: number = 0; i < 6; i++) {
                this._seatUIList.push(this._viewUI["seat" + i]);
                this._seatUIList[i].clip_money.visible = false;
                this._seatUIList[i].on(LEvent.CLICK, this, this.onSelectSeat, [i]);
            }
            for (let i: number = 0; i < 4; i++) {
                this._aniKaiList.push(this._viewUI["ani_kai" + i]);
                this._aniKaiList[i].visible = false;
                this._aniKaiList[i].ani_kaipai.on(LEvent.COMPLETE, this, this.onSeeCardOver, [i]);
            }
            this._viewUI.list_record.itemRender = this.createChildren("game_ui.baijiale.component.RecordRenderUI", MapRecordRender);
            this._viewUI.list_record.renderHandler = new Handler(this, this.renderHandler);
            if (!this._htmlText) {
                this._htmlText = TextFieldU.createHtmlText(this._viewUI.txt_online);
            }
            this._turnClip = new BaijialeClip(BaijialeClip.GAME_ROUND);
            //主玩家UI
            this._viewUI.main_player.clip_money.visible = false;
            //界面UI
            this._viewUI.txt_id.visible = false;
            this._viewUI.box_time.visible = false;
            this._viewUI.xipai.visible = false;
            this._viewUI.paixieRight.ani_chupai.gotoAndStop(12);
            this._viewUI.paixieRight.ani2.gotoAndStop(0);
            this._viewUI.box_road.visible = false;
            this._viewUI.box_xian.visible = false;
            this._viewUI.box_zhuang.visible = false;
            this._viewUI.btn_repeat.disabled = true;
        }

        private renderHandler(cell: MapRecordRender, index: number) {
            if (cell) {
                cell.setData(this._game, cell.dataSource);
            }
        }

        private initRoomConfig(): void {
            let maplv = this._baijialeMapInfo.GetMapLevel();
            if (maplv && ALL_GAME_ROOM_CONFIG_ID.indexOf(maplv) != -1) {
                this._chipArr = ROOM_CHIP_CONFIG[maplv];
                this._robotConfig = ROBOT_NUM_CONFIG[maplv];
                this._seatlimit = BaijialeMapPage.MONEY_LIMIT_CONFIG[maplv][1];
                this._betlimit = BaijialeMapPage.MONEY_LIMIT_CONFIG[maplv][2];

                if (this._robotConfig) {
                    this.updateOnline();
                }
                if (!this._chipArr) return;
                for (let i = 0; i < this._chipArr.length; i++) {
                    this._chipUIList[i].label = EnumToString.sampleChipNum(this._chipArr[i]);
                }
                if (!this._curChip) this.onSelectChip(0);
            }
        }

        private onUpdateCardType(): void {
            this._addCardType = this._baijialeMapInfo.GetAddCardType();
        }

        private onUpdateCardPool(data?: number): void {
            let mapInfo = this._game.sceneObjectMgr.mapInfo;
            if (!mapInfo) return;
            let cardPoolCount = mapInfo.GetCardPoolCount();
            this._viewUI.txt_cardRight.text = cardPoolCount.toString();
            if (data) {//手动更新
                this._viewUI.txt_cardLeft.text = (CARDS_TOTAL_COUNT - cardPoolCount).toString()
            } else {//监听更新
                this._viewUI.txt_cardLeft.text = (CARDS_TOTAL_COUNT - cardPoolCount - this._baijialeMgr.allCards.length).toString()
                if (this._askTimes > 1) {
                    this._viewUI.txt_cardLeft.text = (CARDS_TOTAL_COUNT - cardPoolCount - this._baijialeMgr.allCards.length - 1).toString()
                }
            }
        }

        private onUpdateTurn(): void {
            if (!this._baijialeMapInfo) return;
            this._turnClip.x = this._viewUI.txt_turn.x;
            this._turnClip.y = this._viewUI.txt_turn.y;
            this._turnClip.anchorX = 0.5;
            this._viewUI.txt_turn.visible = false;
            this._viewUI.txt_turn.parent.addChild(this._turnClip);
            let turnNum = this._baijialeMapInfo.GetRound();
            this._turnClip.setText(turnNum, true, false);
        }

        //重置UI
        private resetUI(): void {
            //主玩家UI
            this._viewUI.main_player.clip_money.visible = false;
            //界面UI
            // this._viewUI.img_banker.visible = true;
            for (let i = 0; i < 7; i++) {
                if (i < 5) {
                    this._txtBetUIList[i].text = "0";
                }
                if (i < 2) {
                    this._htmlTextArr[i].innerHTML = "<span style='color:#ffd200'>0</span><span style='color:#ffffff'>/0</span>";
                } else {
                    this._txtTotalUIList[i].text = "0";
                }
            }
            this._viewUI.box_xian.visible = false;
            this._viewUI.box_zhuang.visible = false;
        }

        private resetData(): void {
            this._battleIndex = -1;
            this._cardsArr = [];
            this._betTotalList = [0, 0, 0, 0, 0, 0, 0];
            this._betMainList = [0, 0, 0, 0, 0, 0, 0];
            this._askTimes = 0;
            this._mainPlayerBenefit = 0;
            this._betMainTotal = 0;
            this._lottery = "";
            if (this._baijialeMgr) this._baijialeMgr.isReConnect = false;
            for (let i = 0; i < 7; i++) {
                this._chipTotalList[i] = [];
            }
        }

        public close(): void {
            if (this._viewUI) {
                this._viewUI.btn_spread.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_back.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_rule.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_set.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_zhanji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_repeat.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_playerList.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_chongzhi.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_road.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_qifu.off(LEvent.CLICK, this, this.onBtnClickWithTween);

                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);

                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_GAME_TURN_CHANGE, this, this.onUpdateTurn);//回合数变化
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时时间戳更新
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_SEATED_LIST, this, this.onUpdateSeatedList);//入座列表更新
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_CARD_POOL_CHANGE, this, this.onUpdateCardPool);//牌库数量变化
                this._game.sceneObjectMgr.off(BaijialeMapInfo.EVENT_ADD_CARD_TYPE, this, this.onUpdateCardType);//补牌类型

                this._game.qifuMgr.off(QiFuMgr.QIFU_FLY, this, this.qifuFly);

                for (let i: number = 0; i < 7; i++) {
                    this._areaList[i] && this._areaList[i].off(LEvent.CLICK, this, this.onAreaBetClick);
                }
                this._areaList = [];
                for (let i: number = 0; i < 5; i++) {
                    this._chipUIList[i] && this._chipUIList[i].off(LEvent.CLICK, this, this.onSelectChip);
                }
                this._chipUIList = [];
                for (let i: number = 0; i < 6; i++) {
                    this._seatUIList[i] && this._seatUIList[i].off(LEvent.CLICK, this, this.onSelectSeat, [i]);
                }
                this._seatUIList = [];
                for (let i: number = 0; i < 4; i++) {
                    if (this._aniKaiList[i] && this._aniKaiList[i].ani_kaipai) {
                        this._aniKaiList[i].ani_kaipai.off(LEvent.COMPLETE, this, this.onSeeCardOver, [i]);
                    }
                }
                this._aniKaiList = [];
                this._chipTotalList = [];
                this._viewUI.paixieRight.ani_chupai.stop();
                this._viewUI.paixieRight.ani2.gotoAndStop(0);
                this.resetAll();
                if (this._baijialeMgr) {
                    this._baijialeMgr.off(BaijialeMgr.DEAL_OVER, this, this.onUpdateAniDeal);
                    // this._baijialeMgr.off(BaijialeMgr.SHOW_OVER, this, this.onUpdateResult);
                }
                this._game.uiRoot.HUD.close(BaijialePageDef.PAGE_BAIJIALE_BEGIN);
                this._game.uiRoot.HUD.close(BaijialePageDef.PAGE_BAIJIALE_END);
                this._baijialeStory && this._baijialeStory.clear();
                this._game.stopAllSound();
                this._game.stopMusic();
                this._turnClip.removeSelf();
                this._turnClip.destroy(true);
                this._turnClip = null;
            }
            super.close();
        }
    }
    class MapRecordRender extends ui.nqp.game_ui.baijiale.component.RecordRenderUI {
        private _game: Game;
        private _data: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._game = game;
            this._data = data;
            if (this._data != 0 && this._data != 1 && this._data != 2) {
                this.visible = false;
                return;
            }
            this.visible = true;
            this.record.skin = StringU.substitute(Path_game_baijiale.ui_baijiale + "zs_{0}.png", this._data);
        }
        destroy() {
            super.destroy();
        }
    }
}