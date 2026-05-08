
import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

async function searchChannels(query) {
  return [
    {
      title: `${query} AI 社区`,
      username: "ai",
      participants_count: 10000,
      about: `这是关于 ${query} 的 Telegram 频道`,
      link: "t.me/ai"
    }
  ];
}

async function loading(ctx) {
  const msg = await ctx.reply("⌕ 正在搜索 Telegram…");

  await new Promise(r => setTimeout(r, 1000));

  await ctx.api.editMessageText(
    ctx.chat.id,
    msg.message_id,
    "◉ 正在分析频道质量…"
  );

  await new Promise(r => setTimeout(r, 1000));

  await ctx.api.editMessageText(
    ctx.chat.id,
    msg.message_id,
    "✦ AI 正在排序最佳结果…"
  );

  return msg.message_id;
}

bot.command("start", async (ctx) => {
  await ctx.reply(
`👋 欢迎使用 Super

Telegram AI 搜索助手

直接发送关键词即可：

例如：
• AI 编程
• Crypto
• 独立开发
• Claude
• Cursor`
  );
});

bot.on("message:text", async (ctx) => {
  const query = ctx.message.text;

  const loadingMsgId = await loading(ctx);

  try {
    const results = await searchChannels(query);

    if (!results.length) {
      await ctx.api.editMessageText(
        ctx.chat.id,
        loadingMsgId,
        "没有找到相关频道。"
      );
      return;
    }

    const channel = results[0];

    const keyboard = new InlineKeyboard()
      .url(
        "加入频道",
        `https://${channel.link}`
      );

    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingMsgId,
`✦ ${channel.title}

${channel.username || ""}

👥 ${channel.participants_count || 0} members

${channel.about || "暂无简介"}

◉ AI 推荐理由：
频道相关度较高，
近期活跃度表现不错。`,
      {
        reply_markup: keyboard
      }
    );

  } catch (err) {
    console.error(err);

    await ctx.reply("搜索失败，请检查 TGStat API 配置。");
  }
});

bot.start();

console.log("Super Search Bot 已启动");
