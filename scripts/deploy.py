import click
from ape.cli import ConnectedProviderCommand
from ape import accounts, project


@click.command(cls=ConnectedProviderCommand)
def cli(network):
    """
    Script for production deployment of Silver Bets
    """
    sender = accounts.test_accounts[-1]
    if "avalanche" in network:
        sender = accounts.load("silver-bets")
        sender.set_autosign(True)

    fee = int(0.025e18)
    return project.SilverBet.deploy(sender, fee, sender=sender)
