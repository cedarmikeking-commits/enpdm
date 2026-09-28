# PDM - Project Development Management

## 项目简介
test
基于 React + TypeScript + Vite 的现代化前端项目。

## 技术栈

- **框架**: React 18.3+
- **构建工具**: Vite 5.4+
- **语言**: TypeScript 5.5+
- **状态管理**: Redux Toolkit + Redux Persist
- **路由**: React Router DOM 7.9+
- **UI 组件库**: Ant Design 5.27+
- **样式**: Tailwind CSS + Sass
- **国际化**: i18next
- **数据请求**: Axios + TanStack Query
- **代码规范**: ESLint 9 + Prettier
- **Git 钩子**: Husky + lint-staged + commitlint

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

### 预览生产构建

```bash
pnpm preview
```

## Git Commit 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来规范 commit 信息。

### Commit 消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型说明

| Type     | 说明                                              | 示例                                  |
| -------- | ------------------------------------------------- | ------------------------------------- |
| feat     | 新功能                                            | `feat: 添加用户登录功能`              |
| fix      | 修复 Bug                                          | `fix: 修复登录页面验证码不显示的问题` |
| docs     | 文档更新                                          | `docs: 更新 README 安装说明`          |
| style    | 代码格式（不影响代码运行的变动）                  | `style: 格式化代码缩进`               |
| refactor | 重构（既不是新增功能，也不是修改 bug 的代码变动） | `refactor: 重构用户认证模块`          |
| perf     | 性能优化                                          | `perf: 优化列表渲染性能`              |
| test     | 测试相关                                          | `test: 添加用户模块单元测试`          |
| build    | 构建系统或外部依赖的变动                          | `build: 升级 vite 到 5.4.2`           |
| ci       | CI 配置文件和脚本的变动                           | `ci: 添加 GitHub Actions 工作流`      |
| chore    | 其他不修改 src 或测试文件的变动                   | `chore: 更新 .gitignore`              |
| revert   | 回退之前的 commit                                 | `revert: 撤销 feat: 添加用户登录功能` |

### Scope（可选）

用于说明 commit 影响的范围，例如：

- `auth`: 认证相关
- `user`: 用户模块
- `api`: API 接口
- `ui`: UI 组件
- `config`: 配置文件

### Subject

对 commit 目的的简短描述，要求：

- 使用祈使句，现在时态："添加"而不是"已添加"或"添加了"
- 不要大写首字母
- 结尾不加句号（.）
- 长度不超过 100 个字符

### 示例

```bash
# 好的提交示例
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(ui): 修复按钮点击无响应问题"
git commit -m "docs: 更新开发文档"
git commit -m "style: 统一代码缩进格式"
git commit -m "refactor(api): 优化请求拦截器结构"
git commit -m "perf(list): 优化长列表渲染性能"
git commit -m "chore: 更新依赖包版本"

# 不好的提交示例
git commit -m "update"                    # ❌ 类型缺失
git commit -m "Fix bug"                   # ❌ type 应该小写
git commit -m "fix: Fix bug."             # ❌ 结尾不应该有句号
git commit -m "add new feature"           # ❌ 缺少 type
```

### Commit 验证

项目已配置 `commitlint` 和 `husky`，在每次提交时会自动验证 commit 信息格式。如果格式不符合规范，提交将被拒绝。

#### 验证规则

- ✅ type 必须是预定义的类型之一
- ✅ type 必须小写
- ✅ subject 不能为空
- ✅ subject 结尾不能有句号
- ✅ 整个 header（type + scope + subject）不能超过 100 个字符

## 代码规范

### 代码检查和格式化

项目配置了 ESLint 和 Prettier 进行代码检查和格式化。

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **lint-staged**: 仅对暂存的文件进行检查

### Pre-commit 钩子

在每次 git commit 之前，会自动执行以下操作：

1. 对暂存的 `.ts`、`.tsx`、`.js`、`.jsx` 文件运行 `eslint --fix` 和 `prettier --write`
2. 对暂存的 `.json`、`.css`、`.scss`、`.md` 文件运行 `prettier --write`

如果检查不通过，提交将被终止。

## 项目结构

```
PDM/
├── src/
│   ├── api/              # API 请求相关
│   ├── components/       # 公共组件
│   ├── config/           # 配置文件
│   ├── constant/         # 常量定义
│   ├── hooks/            # 自定义 Hooks
│   ├── i18n/             # 国际化配置
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   ├── router/           # 路由配置
│   ├── store/            # Redux 状态管理
│   ├── theme/            # 主题配置
│   └── utils/            # 工具函数
├── mock/                 # Mock 数据
├── .husky/               # Git hooks
├── commitlint.config.js  # Commitlint 配置
├── eslint.config.js      # ESLint 配置
├── tailwind.config.js    # Tailwind CSS 配置
├── vite.config.ts        # Vite 配置
└── tsconfig.json         # TypeScript 配置
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置相应的环境变量。
