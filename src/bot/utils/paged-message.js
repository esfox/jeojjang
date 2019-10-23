module.exports = class
{
	/**
	 * @param {import('discord-utils').Context} context
	 * @param {string} title
	 * @param {pages} Array
	 * @param {Function} [onPageChange]
	 * */
	async send(context, title, initial, pages, onPageChange)
	{
		this.author = context.message.author.id;
		this.title = title;
		this.page = 0;
		this.pages = pages;
		this.content = initial;
		this.callback = onPageChange;
		
		if(pages > 1)
		{
			this.message = await context.chat(this.text());
			await this.react();
			this.wait(); 
		}
		else await context.chat(this.text());
	}

	text()
	{
		return `${this.title}\n\n${this.content}`;
	}

	async wait()
	{
		const reactions = await this.message.awaitReactions((reaction, user) =>
			user.id === this.author &&
			['⬅', '➡'].includes(reaction.emoji.name),
			{
				max: 1,
				time: 30000
			});

		if(!reactions || reactions.size === 0)
		{
			this.message.reactions.filter(r => r.me).forEach(async r => r.remove());
			return Promise.resolve();
		}

		const reaction = reactions.first().emoji.name;
		if(reaction === '➡')
			this.next();
		if(reaction === '⬅')
			this.previous();
	}

	async change()
	{
		if(this.callback)
			this.content = await this.callback(this.page);

		await this.resend();
		await this.react();
		this.wait();
	}

	async resend()
	{
		this.message = await this.message.delete();
		this.message = await this.message.channel.send(this.text());
	}

	async react()
	{
		if(this.page !== 0)
			await this.message.react('⬅');

		if(this.page < this.pages - 1)
			await this.message.react('➡');
	}

	next()
	{
		this.page++;
		this.change();
	}

	previous()
	{
		this.page--;
		this.change();
	}
}
