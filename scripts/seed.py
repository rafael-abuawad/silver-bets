import click
import random
from ape.cli import ConnectedProviderCommand
from ape import accounts, project


@click.command(cls=ConnectedProviderCommand)
def cli(network):
    """
    Seed script for Silver Bets
    """
    if "avalanche" in network:
        sender = accounts.load("silver-bets")
        sender.set_autosign(True)

        silver_bet = project.SilverBet.at("XXX")
        title = "Presidential Election"
        description = "Bet on the next president."
        options = ["Candidate A", "Candidate B"]
        min_bet = int(0.00025e18)
        silver_bet.createBet(
            title, description, min_bet, options, sender=sender, value=fee
        )

    else:
        sender = accounts.test_accounts[-1]
        fee = int(0.025e18)
        silver_bet = project.SilverBet.deploy(sender, fee, sender=sender)

        title = "Presidential Election"
        description = "Bet on the next president."
        options = ["Candidate A", "Candidate B"]
        min_bet = int(0.00025e18)
        id = 0
        silver_bet.createBet(
            title, description, min_bet, options, sender=sender, value=fee
        )

        for account in accounts.test_accounts:
            option = random.randint(0, 1)
            bet_amount = random.randint(min_bet, min_bet * 25)
            silver_bet.enterBet(id, option, sender=account, value=bet_amount)

        click.echo(silver_bet.totalSupply())
