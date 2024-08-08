import ape


def test_initial_values(silver_bet, sender):
    assert silver_bet.name() == "Silver Bet"
    assert silver_bet.symbol() == "AGB"
    assert silver_bet.totalSupply() == 0
    assert silver_bet.owner() == sender


def test_no_bets_created_yet(silver_bet):
    for id in range(10):
        with ape.reverts():
            silver_bet.getTokenInfo(id)

        with ape.reverts():
            silver_bet.getTitle(id)

        with ape.reverts():
            silver_bet.getDescription(id)

        with ape.reverts():
            silver_bet.getMinimumBet(id)

        with ape.reverts():
            silver_bet.getStartDate(id)

        with ape.reverts():
            silver_bet.getBalance(id)

        with ape.reverts():
            silver_bet.getOwner(id)

        with ape.reverts():
            silver_bet.getIsBettingActive(id)

        with ape.reverts():
            silver_bet.getOptionList(id)

        with ape.reverts():
            silver_bet.getBetList(id)


def test_create_bet(silver_bet, fee, sender):
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)

    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)
    id = 0

    assert silver_bet.ownerOf(0) == sender

    bet_uri = silver_bet.tokenURI(id)
    assert bet_uri == f"http://localhost:3000/{id}"

    bet_title = silver_bet.getTitle(id)
    assert bet_title == title

    bet_description = silver_bet.getDescription(id)
    assert bet_description == description

    bet_options = silver_bet.getOptionList(id)
    assert len(bet_options) == len(options)
    for i in range(2):
        assert bet_options[i] == options[i]

    bet_min_bet = silver_bet.getMinimumBet(id)
    assert bet_min_bet == min_bet

    owner = silver_bet.getOwner(id)
    assert sender == owner

    betting_active = silver_bet.getIsBettingActive(id)
    assert betting_active

    bet_list = silver_bet.getBetList(id)
    assert len(bet_list) == 0
