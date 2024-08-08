import ape
import random


def test_initial_values(silver_bet, sender):
    """
    Prueba que los valores iniciales del contrato sean los esperados.
    """
    assert silver_bet.name() == "Silver Bet"
    assert silver_bet.symbol() == "AGB"
    assert silver_bet.totalSupply() == 0
    assert silver_bet.owner() == sender


def test_no_bets_created_yet(silver_bet):
    """
    Prueba que no se pueda acceder a información de apuestas que aún no se han creado.
    """
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


def test_create_bet_and_test_getters(silver_bet, fee, sender):
    """
    Prueba que se pueda crear una apuesta y verificar su información a través de los métodos getter.
    """
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


def test_create_bet_and_test_information(silver_bet, fee, sender):
    """
    Prueba que la información de la apuesta creada se almacene correctamente.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)

    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)
    id = 0
    info = silver_bet.getTokenInfo(id)

    assert info.title == title
    assert info.description == description
    assert info.minimumBet == min_bet
    assert info.balance == 0
    assert info.owner == sender

    bet_options = silver_bet.getOptionList(id)
    assert len(bet_options) == len(options)
    for i in range(2):
        assert bet_options[i] == options[i]


def test_create_bet_and_players_enter(silver_bet, fee, sender, accounts):
    """
    Prueba que los jugadores puedan participar en una apuesta creada.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)

    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)

    id = 0
    bets = []
    total_bet_balance = 0

    for account in accounts:
        # Truco para quitar la direccion del sender en Anvil
        if sender == account:
            continue

        option = random.randint(0, 1)
        bet_amount = random.randint(min_bet, min_bet * 10)
        silver_bet.enterBet(id, option, sender=account, value=bet_amount)

        bets.append({"bettor": account, "amount": bet_amount, "option": option})
        total_bet_balance += bet_amount

    silver_bet_bets = silver_bet.getBetList(id)
    assert len(silver_bet_bets) == len(bets)

    for i in range(len(bets)):
        assert silver_bet_bets[i].bettor == bets[i].get("bettor")
        assert silver_bet_bets[i].amount == bets[i].get("amount")
        assert silver_bet_bets[i].option == bets[i].get("option")

    assert silver_bet.getBalance(id) == total_bet_balance


def test_create_bet_participate_and_only_owner_can_end_it(
    silver_bet, fee, sender, accounts
):
    """
    Prueba que solo el propietario de la apuesta pueda cerrarla.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)

    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)

    id = 0
    bets = []
    total_bet_balance = 0

    for account in accounts:
        # Truco para quitar la direccion del sender en Anvil
        if sender == account:
            continue

        option = random.randint(0, 1)
        bet_amount = random.randint(min_bet, min_bet * 10)
        silver_bet.enterBet(id, option, sender=account, value=bet_amount)

        bets.append({"bettor": account, "amount": bet_amount, "option": option})
        total_bet_balance += bet_amount

    assert silver_bet.getOwner(id) == sender
    for account in accounts:
        # Truco para quitar la direccion del sender en Anvil
        if sender == account:
            continue

        with ape.reverts():
            winner_option = random.randint(0, 1)
            silver_bet.closeBet(id, winner_option, sender=account)


def test_create_bet_participate_and_collect_winnings(silver_bet, fee, sender, accounts):
    """
    Prueba que se puedan reclamar los premios de una apuesta cerrada.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)

    # El balance inicial del contrato es 0
    assert silver_bet.balance == 0

    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)

    # El balance del contrato es el fee una vez creada la apuesta
    assert silver_bet.balance == fee

    id = 0
    bets = []
    total_bet_balance = 0

    for account in accounts:
        # Truco para quitar la direccion del sender en Anvil
        if sender == account:
            continue

        option = random.randint(0, 1)
        bet_amount = random.randint(min_bet, min_bet * 10)
        silver_bet.enterBet(id, option, sender=account, value=bet_amount)

        bets.append({"bettor": account, "amount": bet_amount, "option": option})
        total_bet_balance += bet_amount

    winner_option = random.randint(0, 1)

    initial_balances = {}
    for account in accounts:
        initial_balances[str(account)] = account.balance

    print(silver_bet.tokenURI(id))

    silver_bet.closeBet(id, winner_option, sender=sender)

    for bet in bets:
        bettor = bet.get("bettor")
        if bet.get("option") == winner_option:
            assert initial_balances.get(str(bettor)) < bettor.balance
        else:
            assert initial_balances.get(str(bettor)) == bettor.balance


def test_only_owner_can_collect_fees(silver_bet, sender, fee, accounts):
    """
    Prueba que solo el owner puede reclamar los fees.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)
    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)

    for account in accounts:
        # Truco para quitar la direccion del sender en Anvil
        if sender == account:
            continue

        with ape.reverts():
            silver_bet.collectFees(account, sender=account)


def test_owner_can_collect_fees(silver_bet, sender, fee):
    """
    Prueba que el owner puede reclamar los fees.
    """
    title = "A vs B"
    description = "Simple partido de A vs B"
    options = ["A", "B"]
    min_bet = int(0.00025e18)
    silver_bet.createBet(title, description, min_bet, options, sender=sender, value=fee)

    initial_balance = sender.balance
    silver_bet.collectFees(sender, sender=sender)
    assert initial_balance < sender.balance


def test_create_bet_token_uri(silver_bet, fee, accounts):
    """
    Prueba que solo el propietario de la apuesta pueda cerrarla.
    """
    id = 0
    for account in accounts:
        title = "A vs B"
        description = "Simple partido de A vs B"
        options = ["A", "B"]
        min_bet = int(0.00025e18)

        silver_bet.createBet(
            title, description, min_bet, options, sender=account, value=fee
        )
        print(silver_bet.tokenURI(id))
        id += 1
