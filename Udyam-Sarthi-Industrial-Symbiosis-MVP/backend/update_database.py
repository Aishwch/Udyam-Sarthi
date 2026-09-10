import sqlite3

DATABASE_NAME = "udyam_sarthi.db"


def add_column_if_missing(
    cursor,
    table_name,
    column_name,
    column_definition
):
    cursor.execute(
        f"PRAGMA table_info({table_name})"
    )

    existing_columns = [
        row[1]
        for row in cursor.fetchall()
    ]

    if column_name not in existing_columns:

        cursor.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name}
            {column_definition}
            """
        )

        print(
            f"Added {table_name}.{column_name}"
        )

    else:

        print(
            f"{table_name}.{column_name} already exists"
        )


def main():

    connection = sqlite3.connect(
        DATABASE_NAME
    )

    try:

        cursor = connection.cursor()

        # Supplier columns
        add_column_if_missing(
            cursor,
            "suppliers",
            "material_specification",
            "TEXT"
        )

        add_column_if_missing(
            cursor,
            "suppliers",
            "quality_notes",
            "TEXT"
        )

        # Buyer columns
        add_column_if_missing(
            cursor,
            "buyers",
            "material_specification",
            "TEXT"
        )

        add_column_if_missing(
            cursor,
            "buyers",
            "quality_notes",
            "TEXT"
        )

        connection.commit()

        print()
        print(
            "Database update completed successfully."
        )

    except Exception as error:

        connection.rollback()

        print(
            "Database update failed:"
        )

        print(error)

    finally:

        connection.close()


if __name__ == "__main__":
    main()