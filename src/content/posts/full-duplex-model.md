---
title: "全双工模型"
excerpt: "想要一个可以随时提问、打断的老师，于是从 VAD→ASR→LLM→TTS 的级联链路一路试到端到端全双工模型，最后搓了一个 DSH 语音插件 demo。"
publishDate: 2026-11-16
listDate: "Nov 16, 2026"
wordCount: "1,475 Words"
tags:
  - DSH
  - 全双工
  - 语音交互
  - Agent
majorCategory: Articles
thumbnail: "/images/posts/full-duplex-model/ttds-preview.jpg"
draft: false
---

# 背景

最早的想法诞生是因为我觉得现有的和 ds 对话的学习效率不是很拟人，我非常想要一个我可以随时提问、打断的老师，这样学习效率沟通效率才高，原来的时间都花在理解 ai 输出，和让 ai 重新输出上面了

~~没错我想要的就是贾维斯~~

然后很巧 b 站就给我推送了这个视频 [AI助手还在一问一答？做了一个边听边说、边干活的全双工模型，讲一讲背后的技术](https://www.bilibili.com/video/BV1LB4a6DEWL/)

第一次接触了什么是全双工模型

# 从半双工到全双工

> **全双工（Full-Duplex）是指通信双方可以在同一时间、双向**进行数据传输的通信方式，也就是发送方和接收方能够同时发送和接收信号，彼此互不影响。
>
> **半双工（Half-Duplex）：** 双方都可以收发数据，但在**同一时刻只能由一方发送**，不能同时进行（如对讲机）。
>
> **单工（Simplex）：** 数据只能在一个方向上传输（如传统的广播、电视信号）。

现在与大语言模型的一问一答，就是典型的半双工模型，显然牺牲了交流的效率换取了智力

具体来说，与大语言模型的交互方式从半双工改变成全双工，李沫提出了三个要求：

- 具备足够的智商（Smart）
- 像人一样自然交流（Feels human）
- 能一边聊天一边干活（Async Tool Use）

为了简单做个 demo，目标就改为：使用智商不低的模型、低延迟、能打断、说话好听、能异步工具调用

# 从传统方案到端到端

## 传统方案

传统方案基于大语言模型进行各个模型的拼接，具体链路大概是：VAD->ASR->LLM->TTS

_也许我们还可以加上声纹识别，在吵杂说话场景能辨别是否是说话人发声，更高阶的能自主决定是否发声（比如不是在和它说话它就不说）_

> - **VAD（Voice Activity Detection，语音活动检测）：** 负责“听声辨位”，通过监测音频中的静音和波形，判断用户**什么时候开始说话、什么时候说完了**。
> - **ASR（Automatic Speech Recognition，语音识别）：** 负责“把话转字”，将用户输入的语音音频流转换成大语言模型能读懂的**文本**。
> - **LLM（Large Language Model，大语言模型）：** 负责“大脑思考”，对文本进行理解与推理，并生成对应的**回答文本**。
> - **TTS（Text-to-Speech，文本转语音）：** 负责“开口说话”，将大模型生成的文本转化为流畅、自然的**语音音频输出**。

于是我让 ai 搭了一个简易的测试平台测试这四个模型使用不同模型的延迟与效果

<figure class="post-media post-media--center-narrow">
  <img src="/images/posts/full-duplex-model/full-duplex-model-01.png" alt="Voice Model Lab：VAD→ASR→LLM→TTS 级联链路测试平台" />
  <figcaption>级联链路测试平台：VAD→ASR→LLM→TTS 逐段实测延迟。</figcaption>
</figure>

总结来说，效果拉跨，只看一点就绝对不行，延迟太高了，我觉得不是换模型能解决的

就在我思考，从本地部署换成大量的云服务是否能减少大量延迟至可控范围的时候，发现阿里云居然提供端到端的全双工模型，还分为 flash 和 plus 两个版本

## 端到端

端到端就是将传统的链路变成 用户语音->模型->语音输出，可行的原因是因为 ASR、TTS 与 decode only 的 transformer 架构的 LLM 无本质区别，就可以合成一个模型（尚未进军 transformer 界，具体细节不懂）

百炼中我使用的模型是 Qwen-Audio-3.1-Realtime-Flash&Qwen-Audio-3.1-Realtime-Plus

他们的接口有的功能大概是：

- 你可以写一段前置提示词，和 tools
- 你可以上传公网 url 的音频来进行说话人增强
- 你可以使用百炼平台的 `voice_id` 来控制生成的声音
- 流式的方式持续接受音频，模型自动判断什么时候说话人说了一段话
- 判断说话人说话结束时开始尝试调用 tools 并生成语音回复
- tools 的结果会加载进上下文，但需要 `response.create` 主动提示模型再次生成回复，默认收到工具调用结果不自动生成语音回复
- `conversation.item.create` 用来添加内容至模型上下文，tool call 的结果是其中一种
- 语音回复可以被用户打断：云端判断你开始了新的有效发言 → 发出 speech_started，并取消旧响应 → 客户端立即停止播放、清空旧音频队列 → 说完后，模型处理新的问题

于是又做了个网页测试平台

<figure class="post-media post-media--center-narrow">
  <img src="/images/posts/full-duplex-model/full-duplex-model-02.png" alt="Voice Model Lab 对照组合：Qwen3-ASR 1.7B + DeepSeek Flash" />
  <figcaption>同一套测试平台，换用 Qwen3-ASR + DeepSeek Flash 再测一轮。</figcaption>
</figure>

# Demo

既然都研究到这儿了，可以搓个demo体验一下，于是就做了一个 DSH 插件

定位就定位成 DSH 的全局语音总管，可以与用户对话的同时可以调用工具，开新会话或者帮用户审批，然后还能主动汇报会话进展

于是就设计了工具与钩子，工具负责桥接 DSH，钩子负责触发模型生成回复

此外为了能保证用户和模型的交流与后台触发的钩子汇报不冲突，设计了缓冲机制，若用户与模型在对话，则缓存后台信息，等到静默再发过去，触发模型回复

<figure class="post-media post-media--wide">
  <img src="/images/posts/full-duplex-model/full-duplex-model-03.png" alt="ttds 插件的 DSH 桥接工具与事件钩子配置面板" />
  <figcaption>工具桥接 DSH，钩子触发回复，静默礼让避免抢话。</figcaption>
</figure>

[GitHub - whyself/ttds: 面向实时语音对话交互（Talk to DeepSeek）的 DSH 插件包。](https://github.com/whyself/ttds)

vibe 实验性 demo 可以图一乐，未达到背景的畅想，还是不够拟人不够聪明

## 存在的问题

针对 qwen 这个模型，模型能力和智力还不及预期，对话也不是很自然，以后也许可以做长期记忆，模型开口依然受限于用户发问一问一答，或者程序钩子触发，学会开口说话依然未内化到模型里