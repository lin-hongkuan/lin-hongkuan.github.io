---
title: 仓库结构与复现路线
---

# 05｜公开仓库：目录结构和复现流程

仓库：[`buaacyw/code-world-model`](https://github.com/buaacyw/code-world-model)。本页按当前公开 `main` 版本的 README、`ENVIRONMENT.md`、`INFERENCE.md` 和源码整理。**仓库主体是 inference（推理）发布包，不是论文全部训练/Agent 系统的源码。**

## 先看目录树

```text
code-world-model/
├── README.md                     # 项目简介与 Quick Start
├── ENVIRONMENT.md                # 环境、权重、LoRA、示例安装
├── INFERENCE.md                  # 输入格式、配置、prepare/generate
├── LICENSE / NOTICE              # Apache-2.0 与第三方/项目说明
├── examples/
│   ├── config.example.json       # 单窗口 smoke-test 配置模板
│   └── config.multiwindow.example.json
├── patches/                      # 对指定外部推理依赖的兼容补丁
├── scripts/
│   ├── install_release_assets.sh # 下载权重/示例并构造 release 目录
│   ├── materialize_hf_examples.py# 解包压缩 proxy 条件并生成运行配置
│   ├── verify_h800_runtime.py    # H800 环境 smoke test
│   └── verify_musubi_patch.sh    # 校验目标补丁上下文
├── src/cwm_h3_inference/
│   ├── cli.py                     # 命令行入口：validate / prepare / generate
│   ├── config.py                  # 严格读取并验证 JSON 配置
│   ├── constants.py               # 帧数、尺寸、重叠等固定常量
│   ├── duv.py                     # 读取 Depth + Semantic-ID 条件
│   ├── presentation.py             # 拼装 H3 多模态输入 / system prompt
│   ├── cache.py                    # 条件/文本预编码缓存及契约检查
│   ├── engine.py                   # 加载 H3、LoRA，逐窗口采样并拼接
│   ├── runtime.py                  # 运行时 batch 与 LoRA 辅助逻辑
│   └── prompts/                    # 首窗口与续窗使用的系统提示
└── tests/
    ├── test_contract.py            # 配置、缓存、帧数、CLI 契约测试
    ├── test_duv.py                 # DUV 输入格式测试
    └── test_materialize_hf_examples.py
```

其中 `duv` 可理解成 Depth（深度）+ Semantic ID（语义类别图）两种条件的组合表示。源码模块分层也体现了工程边界：CLI 负责入口，配置层负责输入约束，cache 层处理预编码，engine 层做 GPU 生成，测试检查接口不会悄悄漂移。

## 公开仓库**不包含**什么？

- 用于构造论文 gameplay proxy 的闭源游戏代码与工具；
- 从空白环境自动建世界的完整 coding agent；
- 论文所有训练代码、完整数据集以及训练结果视频；
- 模型大权重和缓存的完整拷贝（按文档从公开外部仓库/模型库下载）；
- 一套可以即刻取代游戏引擎的物理仿真系统。

仓库 `scripts/materialize_hf_examples.py` 负责把作者发布的压缩示例展开到要求的每帧深度/语义图格式；**它不是生成 proxy 的 coding agent**。环境指南明确说，proxy 构造工具未公开。

## 三个命令分别做什么

### 1. `validate`：先检查契约

验证 JSON 配置、窗口序列、模型文件和输入路径是否满足当前发布版本契约。它**不加载模型权重，不跑 GPU 采样，也不证明你能生成视频**。

### 2. `prepare`：提前准备模型输入

使用视频 VAE / Qwen 等组件对 anchor、proxy、文本多模态 presentation 做编码，并保存 safetensors cache 与 manifest。缓存里记录配置契约；配置变了却复用旧 cache，应该被拒绝。

### 3. `generate`：按窗口生成并输出

加载 MiniMax H3 Ref2VA BF16、发布的 CWM LoRA 与缓存条件；按配置逐个采样 124 帧窗口，保留/恢复有效窗口文件；然后去掉续窗前 34 帧重叠，拼成静音 H.264 MP4，并写 JSON receipt。发布文档明确要求不要让两个进程共用同一 cache/output 目录。

## 推荐的复现路径

### 读代码之前

1. 先看 README，再看 `INFERENCE.md` 的输入契约和 `ENVIRONMENT.md` 的环境条件。
2. 记录当前 commit、Python/CUDA/PyTorch/FlashAttention/Musubi 版本。
3. 确认机器有 CUDA GPU；作者验证环境是 Linux、Python 3.10.15、CUDA toolkit 12.4 构建 FA3、PyTorch CUDA 12.8、**一张 H800 80GB**。
4. 理解发布测试配置：MiniMax H3 BF16 Ref2VA + 兼容 LoRA；单张 H800 + FlashAttention-3；124 帧窗、34 帧重叠、20 步 Euler、1344×768、24 FPS。文档明确说这个 release 的关键推理设置固定。

### 下载与运行

```bash
# 在仓库根目录，准备一个独立目录，不要覆盖已有数据
./scripts/install_release_assets.sh "$PWD/release"
cd release
CONFIG=examples/example_01/config.json

python -m cwm_h3_inference validate --config "$CONFIG"
CUDA_VISIBLE_DEVICES=0 python -m cwm_h3_inference prepare --config "$CONFIG"
CUDA_VISIBLE_DEVICES=0 python -m cwm_h3_inference generate --config "$CONFIG"
```

运行前请先读授权条款、显存要求与外部权重下载方式。当前开发环境没有 H800，也没有完成此论文推理跑通；这份指南只是根据官方文档和源码说明流程，不宣称替你实机生成成功。

## 建议的源码阅读顺序

1. `README.md`：定位发布包能做什么。
2. `examples/config.multiwindow.example.json`：看一次运行由什么参数描述。
3. `config.py`、`constants.py`：理解可调与固定设置，读懂 124/34/90 的契约。
4. `duv.py`：看每帧深度和语义图怎样变成条件张量。
5. `presentation.py`：看 anchor、proxy video、text 如何排成 H3 输入。
6. `cache.py`：理解为什么预先编码、manifest 怎样避免错用缓存。
7. `engine.py`：沿 `sample_window` 和 `write_video` 理解逐窗生成、恢复和拼接。
8. `tests/`：看项目如何防止配置、输入形状、缓存格式悄悄改变。

## 新手读代码时先追一条数据流

```text
JSON config
→ config.py 验证路径/窗口/帧距/seed
→ duv.py 读取逐帧深度和语义图
→ cache.py 编码并缓存 anchor、proxy、文本
→ presentation.py 按 H3 约定排列多模态输入
→ engine.py 加载 H3+LoRA 生成每个窗口
→ overlap 去重并导出 MP4 + receipt
```

沿着这条路径读，比从 `engine.py` 第一行硬啃快很多。遇到外部函数（来自 Musubi/H3）时，标注“本仓库代码”与“第三方实现”的边界。

## 许可证提示

GitHub 仓库标注 Apache-2.0；但完整复现还涉及基础模型、LoRA、Hugging Face 数据集以及被 patch 的第三方依赖，各自的许可/使用条款可能不同。**代码仓库许可证不自动覆盖所有权重、数据和依赖。**

**本页依据：** 官方 [README](https://github.com/buaacyw/code-world-model/blob/main/README.md)、[ENVIRONMENT.md](https://github.com/buaacyw/code-world-model/blob/main/ENVIRONMENT.md)、[INFERENCE.md](https://github.com/buaacyw/code-world-model/blob/main/INFERENCE.md) 与源码目录。

[下一章：怎么批判性评估它的主张？](/cwm/06-critique)
